import axios from 'axios';

const instance = axios.create({
    baseURL: '/backend',
    // timeout: 1000,  // set the default timeout to 1000ms 
});

/*
export const getExample = (data: { [key: string]: any }) => {
    return instance.get('/get_example', {
        params: data
    });
};

export const postExample = (data: { [key: string]: any }) => {
    return instance.post('/post_example', data);
};
*/

export const dataManager = (variable: string, value: any = null) => {
    return instance.post('/data_manager', { variable, value });
};

export const getAnswer = (prompt: string) => {
    return instance.post('/get_answer', { prompt });
};