import axios from 'axios';
import {SERVICE_URL} from '../config'


export const saveRoadData = (data, fn) => {
    return new Promise((resolve, reject) => {
        axios.post(`${SERVICE_URL}/api/road/uploadshowsdata`, {data: data, name: fn}, {})
            .then(r => resolve(r.data))
            .catch(reject)
    })
}

export const getFiles = () => {
    return new Promise((resolve, reject) => {
        axios.get(`${SERVICE_URL}/api/road/files`, {})
            .then(r => resolve(r.data.data))
            .catch(reject)
    })
}

export const getFileToShow = (fn) => {
    return new Promise((resolve, reject) => {
        axios.get(`${SERVICE_URL}/api/road/file?fn=${fn}`, {})
            .then(r => resolve(r.data.data))
            .catch(reject)
    })
}
