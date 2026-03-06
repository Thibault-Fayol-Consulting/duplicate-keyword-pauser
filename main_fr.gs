/**
 * --------------------------------------------------------------------------
 * duplicate-keyword-pauser - Google Ads Script for SMBs
 * --------------------------------------------------------------------------
 * Author: Thibault Fayol - Consultant SEA PME
 * Website: https://thibaultfayol.com
 * License: MIT
 * --------------------------------------------------------------------------
 */
var CONFIG = { TEST_MODE: true, KEEP_HIGHER_QS: true };
function main() {
    Logger.log("Analyse des mots-clés en doublon dans le compte...");
    var kwIter = AdsApp.keywords().withCondition("Status = ENABLED").withCondition("CampaignStatus = ENABLED").withCondition("AdGroupStatus = ENABLED").get();
    var kwMap = {};
    var pausedCount = 0;
    
    while(kwIter.hasNext()) {
        var kw = kwIter.next();
        var key = kw.getText().toLowerCase() + "||" + kw.getMatchType();
        
        if (!kwMap[key]) {
            kwMap[key] = kw;
        } else {
            var existingKw = kwMap[key];
            var kwToPause = kw;
            
            if (CONFIG.KEEP_HIGHER_QS) {
                var existQs = existingKw.getQualityScore() || 5;
                var currentQs = kw.getQualityScore() || 5;
                if (currentQs > existQs) {
                    kwToPause = existingKw;
                    kwMap[key] = kw; 
                }
            }
            
            Logger.log("Doublon : [" + key + "] dans " + kwToPause.getCampaign().getName() + " - Mise en pause.");
            if (!CONFIG.TEST_MODE) kwToPause.pause();
            pausedCount++;
        }
    }
    Logger.log("Doublons résolus : " + pausedCount);
}
