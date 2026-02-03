import axios from 'axios';
import {SERVICE_URL} from '../config'

export const wgs84totwd97 = (data) => {
    return new Promise((resolve, reject) => {
        axios.post(`${SERVICE_URL}/api/km/gis/wgs84ToTwd97`, {source: data}, {})
            .then(r => resolve(r.data))
            .catch(reject)
    })
}

export const twd97towgs84 = (data) => {
    return new Promise((resolve, reject) => {
        axios.post(`${SERVICE_URL}/api/km/gis/twd97towgs84`, {source: data}, {})
        .then(r => resolve(r.data))
        .catch(reject)
    })
}