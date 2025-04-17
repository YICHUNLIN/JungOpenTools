JungOpenTools
===
一些可以共享的API

# /api/km/gis
### get /wgs84ToTwd97

* name: kmTwd97ToWGS84
* desc: 金門地區WGS84 轉 TWD97?lat=&lng=
* auth: false

> call

https://t.kmn.tw/api/km/gis/twd97towgs84?x=180777.0654&y=2705103.1354

> return 

{"lat":24.450646525129876,"lng":118.31723218839302}

### get /twd97towgs84

* name: kmWGS84ToTWD97
* desc: 金門地區TWD97 轉 WGS84?x=&y=
* auth: false

> call

https://t.kmn.tw/api/km/gis/wgs84totwd97?lat=24.450646525129876&lng=118.31723218839302

> return 

{"x":180777.06539999394,"y":2705103.1353979977}