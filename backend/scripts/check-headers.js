
const url = "https://assets.vinzhub.cloud/strmp/hls/f8979c68-9165-4f91-b7b2-5c02ad7e0b16/master.m3u8";

async function checkHeaders() {
    try {
        console.log(`Checking: ${url}`);
        const res = await fetch(url, {
            method: 'HEAD',
            headers: {
                'Origin': 'http://localhost:3000'
            }
        });

        console.log("Status:", res.status);
        console.log("CORS Headers:");
        console.log("Access-Control-Allow-Origin:", res.headers.get('access-control-allow-origin'));
        console.log("Access-Control-Allow-Methods:", res.headers.get('access-control-allow-methods'));
        console.log("Content-Type:", res.headers.get('content-type'));

    } catch (e) {
        console.error("Error:", e.message);
    }
}

checkHeaders();
