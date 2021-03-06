var app = new Vue({
    el: '#app',
    data: {
        selectedCase: 0,
        totalCases: 13,
        scale: {
            lines: 42,
            lineHeight: 25
        },
        // apiURL: "http://127.0.0.1:5500/db/",
        // apiURL: "http://localhost:63344/wm/wm-internal-tool/db/",
        apiURL: "https://raw.githubusercontent.com/sergiuchilat/wm-internal-tool/master/db/",
        ranges: {}
    },
    computed:{
        resultingRanges() {        
            return this.ranges.results?.map(range => {
                console.log(`index:${range.index}`, range);
                // if(!range.new || this.ranges.existing.find(el => el.index.includes(range.index))?.selected){
                //     return range.existing;
                // }

                if(!this.ranges.existing.find(el => el.index.includes(range.index))){
                    return range.new;
                }

                if(this.ranges.existing.find(el => el.index.includes(range.index))?.mode === 'remove'){
                    return range.new;
                }
                if(this.ranges.existing.find(el => el.index.includes(range.index))?.mode === 'rewrite'){
                    return range.existing;
                }
                if(range.new && this.ranges.existing.find(el => el.index.includes(range.index))?.mode === 'intersect'){
                    return range.new;
                }
                
                return range.existing;
            });
        }
    },
    mounted(){
        this.selectCase(6);
        
    },
    methods: {
        calculateOffset(start){
            return this.scale.lineHeight * start;
        },
        calculateHeight(start, end) {
            return this.scale.lineHeight * ( end -  start);
        },
        removeExisting(){

        },
        async selectCase(caseID){
            if(!caseID){
                return;
            }
            this.selectedCase = caseID;
            try{
                let response = await fetch(`${this.apiURL}case-${caseID}.json`);
                this.ranges = {};
                this.ranges = Object.assign({}, await response.json());
                this.ranges.existing = this.ranges.existing.map(el => {
                    return {
                        ...el,
                        startOffset: this.calculateOffset(el.start),
                        height: this.calculateHeight(el.start, el.end),
                        mode: "intersect"
                    }
                });

                this.ranges.new = this.ranges.new.map(el => {
                    return {
                        ...el,
                        startOffset: this.calculateOffset(el.start),
                        height: this.calculateHeight(el.start, el.end)
                    }
                });
                this.ranges.results = this.ranges.results?.map(el => {
                    let existingRange = null;
                    let newRange = null;
                    if(el.existing) {
                        existingRange = Object.assign({}, {
                            ...el.existing,
                            startOffset: this.calculateOffset(el.existing.start),
                            height: this.calculateHeight(el.existing.start, el.existing.end),
                            removed: false
                        });
                    }
                    if(el.new) {
                        newRange = Object.assign({}, {
                            ...el.new,
                            startOffset: this.calculateOffset(el.new.start),
                            height: this.calculateHeight(el.new.start, el.new.end)
                        });
                    }
                    return {
                        index: el.index,
                        existing: existingRange,
                        new: newRange
                    }
                });
                //console.log(this.ranges.results);
            }catch(e){
                console.log(e);
            }
        }
    }
})