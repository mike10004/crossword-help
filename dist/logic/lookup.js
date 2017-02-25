const WORDS = [
    'pears',
    'seeds',
    'eager',
    'anger',
    'blade',
    'keyed',
    'plume',
    'flume',
    'bloom',
    'cedes',
    'trees',
    'quite',
    'queen',
    'queer',
    'sleet',
    'steel',
    'spire',
    'spiel',
    'spear',
    'spare'

];

function findMatches(template) {
    var pattern = template.split('').map(ch => ch == '_' ? '.' : ch).join('');
    var re = new RegExp(pattern, 'i');
    var matches = WORDS.filter(word => re.test(word));
    console.log('findMatches', re, matches.length);
    return matches;
}

onmessage = function(event) {
    console.log("lookup", event.data);
    const query = event.data;
    
    const result = {
        type: 'OK',
        query: query,
        possibles: findMatches(query.template)
    };
    postMessage(result);
};
