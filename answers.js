map = function() {
    var higher = this.close > this.open;
    var lower = this.close < this.open;
    if(higher)
    {
        emit(
            {
                company: this.company,
                year: this.date.substring(0,4),
                higher: "closed higher"
            },
            1
        )
    }
    else if(lower)
    {
        emit(
            {
                company:this.company,
                year: this.date.substring(0,4),
                lower: "closed lower"
            },
            1
        )

    }
        
}
reduce = function(key, values) {
	var total = 0;
	for( var i = 0; i < values.length; i++ ) {
		total += values[i];
	}
	return total;
}

map = function() {
    var year = this.date.substring(0,4);

    if(this.close > this.open) {
		emit( {company: this.company, year: year, closed: "higher"}, {count: 1} );	
	}
	else if(this.close < this.open){
		emit( {company: this.company, year: year, closed: "lower"}, {count: 1} );	
}
    }

reduce = function(key, values) {
	var total = 0;
	for( var i = 0; i < values.length; i++ ) {
		total += values[i].count;
	}
	return total;
}

results = db.runCommand({
        mapReduce: 'stocks',
        map: map,
        reduce: reduce,
        out: 'test1'
    });

db.test1.find().pretty()


map = function() {
    var stockDate = new Date(this.date);
    var get_year = this.date.substring(0,4); 
	var month = stockDate.getMonth();
    
	if(month <= 2) {
		emit( {company: this.company, year: get_year, quarter: "First"}, {count:1, close: this.close} );	
	}
	else if(month >= 9){
		emit( {company: this.company, year: get_year, quarter: "Fourth"}, {count:1, close: this.close} );	
	}
	else if(month < 9 && month >= 6){
		emit( {company: this.company, year: get_year, quarter: "Third"}, {count:1, close: this.close} );	
	}
	else {
		emit( {company: this.company, year: get_year, quarter: "Second"}, {count:1, close: this.close} );	
	}

}

function reduce2(key, values) {

	var average = 0;

	for (var i = 0; i < values.length; i++) {
		average += values[i].close;
	}

	average /= values.length;

	return {average: average}
}
}
mongoimport.exe --db book --collection loans --type csv --host localhost:27010 --headerline --file 'C:\Users\Isabelle Carballo\Desktop\project\LoanStats3d.csv'
reduce = function(key, values) {
    var sum = 0;
	for( var i = 0; i < values.length; i++ ) {
        sum += values[i].close;
	}
    var avg = sum/values.length;
	return avg;
}
results = db.runCommand({
        mapReduce: 'stocks',
        map: map,
        reduce: reduce,
        out: 'test2'
    });

db.test2.find().pretty()

var sum = [1, 2, 3].reduce(add, 0);

add = function(a, b) {
    return a + b
}
db.system.js.save({
    _id: 'add',
    value: add
});

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
            // id.push(values[i].id);

    }
    var avg = incomes/count1;
	return {average: avg, count: count1};
}

results = db.runCommand({
        mapReduce: 'anova',
        map: map,
        reduce: reduce,
        out: 'groupby'
    });

db.groupby.find().pretty()



function map2() {
	var stockDate 	= new Date(this.date);
	var year 		= stockDate.getFullYear();
	var month 		= stockDate.getMonth()

	if(month <= 2) {
		emit( {company: this.company, year: year, quarter: "First"}, {close: this.close} );	
	}
	else if(month >= 9){
		emit( {company: this.company, year: year, quarter: "Fourth"}, {close: this.close} );	
	}
	else if(month < 9 && month >= 6){
		emit( {company: this.company, year: year, quarter: "Third"}, {close: this.close} );	
	}
	else {
		emit( {company: this.company, year: year, quarter: "Second"}, {close: this.close} );	
	}

}

function reduce2(key, values) {

	var average = 0;

	for (var i = 0; i < values.length; i++) {
		average += values[i].close;
	}

	average /= values.length;

	return {average: average}
}

map = function() { 
    var diff = this.close-this.open 
    var d = Math.round(diff) 
    emit( { 
            company: this.company, 
            diff: d 
        }, 
        1
        ); 
    }

reduce = function(key, values) {
	var total = 0;
	for( var i = 0; i < values.length; i++ ) {
		total += values[i];
	}
	return total;
}

results = db.runCommand({
        mapReduce: 'stocks',
        map: map,
        reduce: reduce,
        out: 'test3'
    });

db.test3.find().pretty()