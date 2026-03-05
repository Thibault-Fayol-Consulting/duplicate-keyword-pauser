/**
 * duplicate-keyword-pauser - Script Google Ads for SMBs
 * Author: Thibault Fayol
 */
var CONFIG = { TEST_MODE: true };
function main(){
  var kwIter = AdsApp.keywords().withCondition("Status = ENABLED").get();
  var seen = {};
  while(kwIter.hasNext()){
    var kw = kwIter.next();
    var text = kw.getText();
    if(seen[text]) { Logger.log("Duplicate: " + text); if(!CONFIG.TEST_MODE) kw.pause(); }
    else { seen[text] = true; }
  }
}