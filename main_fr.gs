/**
 * --------------------------------------------------------------------------
 * Duplicate Keyword Pauser — Script Google Ads
 * --------------------------------------------------------------------------
 * Detecte les mots-cles actifs en doublon (meme texte + type de
 * correspondance) dans tout le compte et met en pause le plus faible
 * selon le Quality Score. Evite la cannibalisation interne.
 *
 * Auteur :  Thibault Fayol — Consultant SEA PME
 * Site :    https://thibaultfayol.com
 * Licence : MIT
 * --------------------------------------------------------------------------
 */

var CONFIG = {
  TEST_MODE: true,                      // true = log uniquement, false = pause les doublons + envoie email
  EMAIL: 'contact@votredomaine.com',    // Destinataire des alertes
  KEEP_HIGHER_QS: true,                // true = garder le mot-cle avec le meilleur QS
  DEFAULT_QS: 5                         // QS par defaut quand getQualityScore() retourne null
};

function main() {
  try {
    Logger.log('Analyse des mots-cles en doublon dans le compte...');

    var kwIter = AdsApp.keywords()
      .withCondition('Status = ENABLED')
      .withCondition('CampaignStatus = ENABLED')
      .withCondition('AdGroupStatus = ENABLED')
      .get();

    var kwMap = {};
    var miseEnPause = [];

    while (kwIter.hasNext()) {
      var kw = kwIter.next();
      var key = kw.getText().toLowerCase() + '||' + kw.getMatchType();

      if (!kwMap[key]) {
        kwMap[key] = kw;
      } else {
        var existingKw = kwMap[key];
        var kwToPause = kw;

        if (CONFIG.KEEP_HIGHER_QS) {
          var existQs = existingKw.getQualityScore();
          var currentQs = kw.getQualityScore();
          existQs = (existQs !== null && existQs !== undefined) ? existQs : CONFIG.DEFAULT_QS;
          currentQs = (currentQs !== null && currentQs !== undefined) ? currentQs : CONFIG.DEFAULT_QS;

          if (currentQs > existQs) {
            kwToPause = existingKw;
            kwMap[key] = kw;
          }
        }

        var info = {
          keyword: kwToPause.getText(),
          matchType: kwToPause.getMatchType(),
          campaign: kwToPause.getCampaign().getName(),
          adGroup: kwToPause.getAdGroup().getName(),
          qs: kwToPause.getQualityScore() || CONFIG.DEFAULT_QS
        };

        Logger.log('Doublon : "' + info.keyword + '" [' + info.matchType + '] dans ' +
                    info.campaign + ' > ' + info.adGroup +
                    ' (QS : ' + info.qs + ') — Mise en pause (QS inferieur)');

        if (!CONFIG.TEST_MODE) {
          kwToPause.pause();
        }
        miseEnPause.push(info);
      }
    }

    Logger.log('Scan termine. Doublons resolus : ' + miseEnPause.length);

    if (miseEnPause.length > 0 && !CONFIG.TEST_MODE && CONFIG.EMAIL !== 'contact@votredomaine.com') {
      var lines = miseEnPause.map(function(p) {
        return '"' + p.keyword + '" [' + p.matchType + '] | ' +
               p.campaign + ' > ' + p.adGroup + ' | QS : ' + p.qs;
      });
      MailApp.sendEmail(CONFIG.EMAIL,
        'Mots-cles doublons : ' + miseEnPause.length + ' mot(s)-cle(s) mis en pause',
        'Les doublons suivants ont ete mis en pause (QS inferieur) :\n\n' + lines.join('\n'));
      Logger.log('Email d\'alerte envoye a ' + CONFIG.EMAIL);
    }
  } catch (e) {
    Logger.log('ERREUR FATALE : ' + e.message);
    if (!CONFIG.TEST_MODE && CONFIG.EMAIL !== 'contact@votredomaine.com') {
      MailApp.sendEmail(CONFIG.EMAIL, 'Duplicate Keyword Pauser — Erreur script', e.message);
    }
  }
}
