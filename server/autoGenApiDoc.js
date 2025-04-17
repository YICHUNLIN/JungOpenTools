const fs = require('fs');
const apipath = process.cwd() + '/src/api';
const result = [];
fs.readdirSync(apipath)
        .filter(file => (file.slice(-3) !== '.js'))
        .forEach(dir => {
            const config = JSON.parse(fs.readFileSync(`${apipath}/${dir}/cfg.json`));
            const t_module = require(`${apipath}/${dir}/${config.index}`);
            if (t_module) {
                if (config.auth && !Array.isArray(config.pms)) {
                    console.log(`-[ERROR]${dir}\t${config.method}\t${config.name}\tcfg error: pms is not array`)
                } else {
                    if (config.auth){
                        const d = {
                            name: dir,
                            desc: config.desc,
                            auth: true,
                            pms:(config.pms && config.pms.length > 0) ? config.pms.join(','): 'ALL'
                        }
                        result.push(`> ${config.method} /api${config.name}\n\n${Object.keys(d).map(k => `* ${k}: ${d[k]}`).join('\n')}\n`)
                    } else {
                        const d = {
                            name: dir,
                            desc: config.desc,
                            auth: false
                        }
                        result.push(`> ${config.method} /api${config.name}\n\n${Object.keys(d).map(k => `* ${k}: ${d[k]}`).join('\n')}\n`)
                    }
                }
            }
        });
fs.writeFileSync(process.cwd()+ `/apiDoc(auto).md`, result.join('\n'))