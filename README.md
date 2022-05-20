# KMart Range service

![Range service](./docs/badges/range-service-coverage.svg)

## Range service for KMART

This exposes API for clients to create ranges again !!!!

## Convert kmart calendar to preferred schema

```
cd kr-range-service/scripts

docker run --rm -p 10000:8888 -e JUPYTER_ENABLE_LAB=yes -v "$PWD":/home/jovyan/work jupyter/datascience-notebook:9b06df75e445
```

open browser http://localhost:10000 and copy token from console and add it in text box in browser

open convert-kmartt-calendar.ipynb file in side bar

hit `command + enter` to run jupyter pandas file, accounting_calendar.csv file will be created in same folder
