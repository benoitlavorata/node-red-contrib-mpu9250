class Stats{
    constructor({
        logCb = null
    }){
        const s = this;
        s.logCb = logCb;
    }

    log(msg){
        const s = this;
        if(s.logCb)
            return s.logCb(`Stats: ${JSON.stringify(msg)}`);
    }

    add(key,value){
        const s = this;
        s.log(`add: ${key}`)
    }
}

module.exports = Stats;