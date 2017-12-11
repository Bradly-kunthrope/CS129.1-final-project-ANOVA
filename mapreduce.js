
map = function() {
    if (isNaN(this.annual_inc))
        {emit ({
            status: this.loan_status
        },
        {
            count: 1,
            income: this.annual_inc
        });}
    else
        {emit ({
            status: this.loan_status
        },
        {
            count: 1, 
            income: this.annual_inc
        });}
}

reduce = function(key, values) {
    var incomes = 0;
    var id = [];
    var count1 = 0;
	for(var i = 0; i < values.length; i++) {
        if(values[i].income != null){
            incomes += values[i].income;
            count1 += values[i].count;}

    }
    avg = incomes/count1;
	return {average: avg, sum: incomes, count: count1};
}

results = db.runCommand({
        mapReduce: 'anova',
        map: map,
        reduce: reduce,
        out: 'groupby'
    });

db.groupby.find()
// { "_id" : { "status" : "Charged Off" }, "value" : { "average" : 74944.2, "sum" : 1498884, "count" : 20 } }
// { "_id" : { "status" : "Current" }, "value" : { "average" : 78247.78048780488, "sum" : 3208159, "count" : 41 } }
// { "_id" : { "status" : "Default" }, "value" : { "average" : 170238.93032258065, "sum" : 15832220.52, "count" : 93 } }
// { "_id" : { "status" : "Fully Paid" }, "value" : { "average" : 68483.6875, "sum" : 2191478, "count" : 32 } }
// { "_id" : { "status" : "In Grace Period" }, "value" : { "average" : 75419.68287605295, "sum" : 62673756.47, "count" : 831 } }
// { "_id" : { "status" : "Late (16-30 days)" }, "value" : { "average" : 76467.7371399387, "sum" : 74861914.66, "count" : 979 } }
// { "_id" : { "status" : "Late (31-120 days)" }, "value" : { "average" : 76383.24568, "sum" : 19095811.42, "count" : 250 } }

//next mapreduce
map2 = function() {
    emit({
        income: "AGGREGATE"
    },
    {
        grand: this.value.sum
    });
}

reduce2 = function(key, values) {
    var total = 0;
    for (i in values){
        total += values[i].grand;
    }
    return {grandtotal: total};
}

results = db.runCommand({
    mapReduce: 'groupby',
    map: map2,
    reduce: reduce2,
    out: 'grandtotal'
});

db.grandtotal.find()
// { "_id" : { "id" : "AGGREGATE" }, "value" : { "grandtotal" : 179362224.07 } }


// 3rd mapreduce: getting mean of grand total for grand mean
map3 = function() {
    emit({
        mean: "GRAND MEAN"
    },
    {
        grandcount: this.value.count,
        totave: this.value.sum
    });
}

reduce3 = function(key, values) {
    var total = 0;
    var count = 0;
    var grandmean = 0;
    for (i in values){
        total += values[i].totave;
        count += values[i].grandcount;
    }
    grandmean = total/count;
    return {grandmean: grandmean, total: count};
}

results = db.runCommand({
    mapReduce: 'groupby',
    map: map3,
    reduce: reduce3,
    out: 'grandmean'
});

db.grandmean.find()
// { "_id" : { "mean" : "GRAND MEAN" }, "value" : { "grandmean" : 79858.51472395369, "total" : 2246 } }

// 4th mapreduce -- mean minus grandmean (part 1)
map4 = function() {
    emit({
        mean: "GRAND MEAN",
    },
    {
        grandcount: this.value.count,
        totave: this.value.sum
    });
    emit({
        id: this._id.status
    },
    {
        grandcount: this.value.count,
        totave: this.value.average
    });

}

reduce4 = function(key, values) {
    var total = 0;
    var count = 0;
    var grandmean = 0;
    for (i in values){
        total += values[i].totave;
        count += values[i].grandcount;
    }
    grandmean = total/count;
    return {grandmean: grandmean, total: count};
}

results = db.runCommand({
    mapReduce: 'groupby',
    map: map4,
    reduce: reduce4,
    out: 'groupmean'
});

db.groupmean.find()

//5th mapreduce: effect determination (part 2)
map5 = function() {
    emit({
        id: this._id.id
    },
    {
        grandcount: this.value.grandcount,
        totave: this.value.totave,
        mean: this._id.mean
    });

}

reduce5 = function(key, values) {
    var total = 0;
    var count = 0;
    var grandmean = 0;
    for (i in values){
        groupmean = values[i].totave-values[i].mean
    }
    grandmean = total/count;
    return groupmean;
}

results = db.runCommand({
    mapReduce: 'groupmean',
    map: map5,
    reduce: reduce5,
    out: 'effects'
});

db.effects.find()

map6 = function() {
    if (isNaN(this.annual_inc))
        {emit ({
            status: this.loan_status
        },
        {
            count: 1,
            income: this.annual_inc
        });}
    else
        {emit ({
            status: this.loan_status
        },
        {
            count: 1, 
            income: this.annual_inc
        });}
}

reduce6 = function(key, values) {
    var incomes = 0;
    var id = [];
    var count1 = 0;
    var sumsquare = 0;
	for(i in values) {
        if(values[i].income != null){
            incomes += values[i].income;
            count1 += values[i].count;}

    }
    avg = incomes/count1;
    for(i in values) {
        if(values[i].income != null){
            sumsquare = Math.pow((values[i].income-avg),2)*count1;
        }
    }
    return sumsquare;
}

results = db.runCommand({
    mapReduce: 'anova',
    map: map6,
    reduce: reduce6,
    out: 'sumsquaresbetween'
});

db.sumsquaresbetween.find()

db.groupby.aggregate([{
    $group: {
        _id: null,
        total: {$sum: "$value.average"} //{ "_id" : null, "total" : 179362224.07 }
    }
 }
])