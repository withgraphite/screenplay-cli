"use strict";
let utils = require('./utils');
class PrivacyPolicy {
    addLists(lists) {
        this.tosdrList = lists.tosdr;
        this.polisisList = lists.polisis;
        this.addDuplicateRulesForParents(this.tosdrList);
        this.addDuplicateRulesForParents(this.polisisList);
    }
    getScoreForUrl(url) {
        let hostname = utils.extractHostFromURL(url);
        let domain = utils.getDomain(url);
        let parent = utils.findParent(hostname.split('.'));
        // prefer tosdr data because that's generated by humans
        let privacyData = this.tosdrList[parent] ||
            this.tosdrList[domain] ||
            this.tosdrList[hostname];
        if (!privacyData) {
            privacyData = this.polisisList[parent] ||
                this.polisisList[domain] ||
                this.polisisList[hostname];
        }
        if (privacyData) {
            return privacyData.score;
        }
    }
    getReasonsForUrl(url) {
        let hostname = utils.extractHostFromURL(url);
        let domain = utils.getDomain(url);
        let parent = utils.findParent(hostname.split('.'));
        let tosdrData = this.tosdrList[parent] ||
            this.tosdrList[domain] ||
            this.tosdrList[hostname];
        let polisisData = this.polisisList[parent] ||
            this.polisisList[domain] ||
            this.polisisList[hostname];
        return {
            tosdr: tosdrData || {},
            polisis: polisisData || {}
        };
    }
    addDuplicateRulesForParents(list) {
        Object.keys(list).forEach((hostname) => {
            let parentEntity = utils.findParent(hostname.split('.'));
            if (parentEntity && !list[parentEntity]) {
                list[parentEntity] = list[hostname];
            }
        });
    }
}
module.exports = new PrivacyPolicy();
//# sourceMappingURL=privacy-policy.js.map