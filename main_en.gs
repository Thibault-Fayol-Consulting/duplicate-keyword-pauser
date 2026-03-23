/**
 * --------------------------------------------------------------------------
 * Duplicate Keyword Pauser — Google Ads Script
 * --------------------------------------------------------------------------
 * Detects duplicate active keywords (same text + match type) across the
 * entire account and pauses the weaker one based on Quality Score.
 * Prevents internal competition and wasted spend.
 *
 * Author:  Thibault Fayol — Consultant SEA PME
 * Website: https://thibaultfayol.com
 * License: MIT
 * --------------------------------------------------------------------------
 */

var CONFIG = {
  TEST_MODE: true,                      // true = log only, false = pause duplicates + send email
  EMAIL: 'contact@domain.com',          // Alert recipient
  KEEP_HIGHER_QS: true,                // true = keep keyword with higher Quality Score
  DEFAULT_QS: 5                         // Fallback QS when getQualityScore() returns null
};

function main() {
  try {
    Logger.log('Scanning for duplicate active keywords across the account...');

    var kwIter = AdsApp.keywords()
      .withCondition('Status = ENABLED')
      .withCondition('CampaignStatus = ENABLED')
      .withCondition('AdGroupStatus = ENABLED')
      .get();

    var kwMap = {};
    var paused = [];

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

        Logger.log('Duplicate: "' + info.keyword + '" [' + info.matchType + '] in ' +
                    info.campaign + ' > ' + info.adGroup +
                    ' (QS: ' + info.qs + ') — Pausing duplicate (lower QS)');

        if (!CONFIG.TEST_MODE) {
          kwToPause.pause();
        }
        paused.push(info);
      }
    }

    Logger.log('Scan complete. Duplicates resolved: ' + paused.length);

    if (paused.length > 0 && !CONFIG.TEST_MODE && CONFIG.EMAIL !== 'contact@domain.com') {
      var lines = paused.map(function(p) {
        return '"' + p.keyword + '" [' + p.matchType + '] | ' +
               p.campaign + ' > ' + p.adGroup + ' | QS: ' + p.qs;
      });
      MailApp.sendEmail(CONFIG.EMAIL,
        'Duplicate Keywords: ' + paused.length + ' keyword(s) paused',
        'The following duplicate keywords were paused (lower QS):\n\n' + lines.join('\n'));
      Logger.log('Alert email sent to ' + CONFIG.EMAIL);
    }
  } catch (e) {
    Logger.log('FATAL ERROR: ' + e.message);
    if (!CONFIG.TEST_MODE && CONFIG.EMAIL !== 'contact@domain.com') {
      MailApp.sendEmail(CONFIG.EMAIL, 'Duplicate Keyword Pauser — Script Error', e.message);
    }
  }
}
