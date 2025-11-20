# run.py

import uvicorn
import config as config

if __name__ == "__main__":
    uvicorn.run("main:app", host=config.APP_HOST, port=config.APP_PORT, reload=config.APP_DEBUG)
