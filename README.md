# OireachtasVote | View voting percentages of TDs in the current Dáil Éireann

Viewable at [https://robmcelhinney.github.io/OireachtasVote/](
https://robmcelhinney.github.io/OireachtasVote/)

Attempted to make this website so that it could solely be hosted by Github, 
no need to use external database or any server side code, a static webpage only.
Python file uses publically available [Houses of the Oireachtas Open Data APIs](https://data.oireachtas.ie/) to make certain requests and then resorts to web scraping [oireachtas.ie](https://www.oireachtas.ie/) where necessary. The resulting info is stored in two json files that make up the site.

## Install

    $ git clone git@github.com:robmcelhinney/OireachtasVote.git
    $ cd OireachtasVote
    $ npm install

## Start & watch

    $ npm start

## Simple build for production

    $ npm run build
    
## Run python web scraper

    $ cd python
    $ python3 OireachtasVoting.py

## Future plans
Find a way to detect the Ceann-comhairle and remove member from the list.
Add a map of Ireland, allowing the user to select a constituency which only returns their selected members in the table. (May add routing for this)

## Any ideas?
Let me know. Should I do the same for the senate?
