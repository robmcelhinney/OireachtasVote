# OireachtasVote | View voting percentages of TDs in Dáil Éireann

Viewable at [https://robmcelhinney.github.io/OireachtasVote/](
https://robmcelhinney.github.io/OireachtasVote/)

Attempted to make this website so that it could solely be hosted by Github, 
no need to use external database or any server side code, a static webpage only.
Python file uses publically available [Houses of the Oireachtas Open Data APIs](https://data.oireachtas.ie/) to request information regarding a Dáil session, its members, and voting records over its period. This resulting info is stored in two json files that make up the site: 
1. members.json stores the politician's name, their party, if the have a cabinet position, and their total votes. 
2. info.json holds info regarding the current Dáil, its parties, and when this python file was run.
Both historical session's jsons files are stored in src/data in the format [dail_number]info.json and [dail_number]members.json.
The current Dáil session is also stored in src/ as info.json and members.json.

## Install

    $ git clone git@github.com:robmcelhinney/OireachtasVote.git
    $ cd OireachtasVote
    $ npm install
    

## Run python web scraper

    $ py python/OireachtasVoting.py

## Start & watch

    $ npm start

## Simple build for production

    $ npm run build
    

## Future plans
Find a way to detect the Ceann-comhairle and remove member from the list.
Add a map of Ireland, allowing the user to select a constituency which only returns their selected members in the table. (May add routing for this)

## Any ideas?
Let me know. Should I do the same for the senate?
