


# model use

## JobAssign

> JobAssign.create

預拌廠-預拌車：蔡永忠 蔡永尚 劉見士 
驗車：張明楠
山外溪-鋼筋：黃承宗 suwandi Irawn  Bambang
山外溪-水電：陳啟義 莊水譚
后湖：李世順(發電機 砲剪 免拆網 砂輪機) Isnanto
后湖-吊鋼筋：陳肇德
大山頂：陳克承 林明雨 陳家豪 Farhan Sajid
大山頂-圍籬：施建興 Riki Widi
塔山：李龍添 陳朝宗 陳冠儒 呂志曜 Turimin Aji
小金重劃區：洪忠信 呂韋震 Rastim
小金重劃區-回土：鄭功文
小金重劃區-植筋：蔡志揚 Muksan
產博：林炳論 簡仁勝 洪輝煌 陳根陣 何昌澔(水車)
產博-級配卡車：黃宗宏 黃暉鈞 李恩德x1 蔡承展x1
保養廠：Ilham
台電-管路：李賢交 翁志勇 林志明 陳興傑 郜天龍(092)
級配廠：楊恭慶 楊敏晟

``` js
JobAssign.create('2024-08-19', new Date().getTime(), {
        "產博": [
            {
                name: '級配面層',
                content: ["簡仁勝", "林炳論", {name: "何昌澔", desc: "水車"}, "陳根陣", "洪輝煌"]
            },
            {
                name: '級配卡車',
                content: ["黃宗宏", "黃暉鈞", {name: "蔡丞展", desc: "x1"}, {name: "李恩德", desc: "x1"}]
            }
        ],
        "后湖": [
            {
                name: "水溝蓋施作",
                content: [{name: "李世順", desc: "發電機 電剪 免拆網 砂輪機"},"Isnanto"]
            },
            {
                name: "吊鋼筋",
                content: ["陳肇德"]
            }
        ],
        "山外溪": [
            {
                name: "水電配管",
                content: ["陳啟義", "莊水譚"]
            },
            {
                name: "剪鋼筋",
                content: [{name: "黃承宗", desc: "帶老鼠尾,載人"}, "Suwandi"]
            },
            {
                name: "綁鋼筋",
                content: ["Bambang", "Irawn"]
            }
        ],
        "大山頂": [
            {
                content: [{name: "陳家豪", desc: "載人"}, "陳克承", "林明雨", "Farhan", "Sajid"]
            },
            {
                name: "圍籬",
                content: ["施建興", "Riki", "Widi"]
            }
        ],
        "小金重劃區": [
            {
                name: "弱電",
                content: ["呂韋震", "洪忠信", "Rastim"]
            },
            {
                name: "回土",
                content: ["鄭功文"]
            },
            {
                name: "植筋",
                content: ["蔡志揚", "Muksan"]
            }
        ],
        "大佛": [],
        "漁港": [],
        "台電": [
            {
                name: '管路',
                content: ["李賢交", {name: "翁志勇", desc: "#11怪手"}, "林志明", "陳興傑", "郜天龍(092)"]
            }
        ],
        "級配廠": [
            {
                content: ["楊恭慶","楊敏晟"]
            }
        ],
        "洗砂廠": [],
        "預拌廠": [
            {
                name: "預拌車",
                content: ["劉見士", {name: "蔡永忠", desc: "機具移動"}, "蔡永尚"]
            }
        ],
        "保養廠": [
            {
                content: ["Ilham"]
            }
        ],
        "鐵工廠": [
            {
                content: ["吳振元", "洪俊裕"]
            }
        ],
        "廠務": []
    })

```