const axios = require('axios');
const fs = require('fs');
const fieldName = ["name", 'elevation', 'x', 'y', 'remark']
const jsonData = fs.readFileSync('./圖根點.csv')
    .toString()
    .split('\n')
    .map(d => d.split(',').reduce((map, v, index) => ({...map, [fieldName[index]]: parseFloat(v) ? parseFloat(v) : v}), {}))
axios.post('https://t.kmn.tw/api/km/gis/twd97towgs84', {source: jsonData}, {})
    .then(r => {
        //const s = r.data.reduce((map, d, i) => [...map, {...jsonData[i], ...d}], []);
        //fs.writeFileSync(`${process.cwd()}/data.json`, JSON.stringify(s))
        const s = r.data.reduce((map, d, i) => [...map, {...jsonData[i], ...d}], []);
        fs.writeFileSync(`${process.cwd()}/data.csv`, s.reduce((map, s) => `${map}\n${Object.values(s)}`, `${fieldName.join(',')},lat,long`))
    })
    .catch(console.log)