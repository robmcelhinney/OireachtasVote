#!/usr/bin/python3

from bs4 import BeautifulSoup
import time
import requests
import json
from datetime import datetime

DAIL_SEARCH_PARAMS = "/en/debates/votes/?voteResultType=all&debateType=dail&datePeriod=term&term=%2Fie%2Foireachtas%2Fhouse%2Fdail%2F"

BASE_URL = "https://www.oireachtas.ie"
MEMBER_PARAM = "&committee=&member=%2Fie%2Foireachtas%2Fmember%2Fid%2F"

headers = {
    'Content-type': 'application/json',
}


def main():
    data = []
    info = {}

    current_dail, seats = get_current_dail_info(info)
    count = get_vote_count(BASE_URL + DAIL_SEARCH_PARAMS + current_dail)
    get_members(current_dail, seats, data)
    get_member_percent(current_dail, count, data)
    get_parties(current_dail, info)
    create_json(data, info, count)


def create_json(data, info, count):
    now = datetime.now()
    info["totalVotes"] = count
    info["dateCreated"] = now.strftime("%d/%m/%Y %H:%M:%S")

    with open('members.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

    with open('info.json', 'w', encoding='utf-8') as f:
        json.dump(info, f, ensure_ascii=False, indent=4)


def get_member_percent(current_dail, total_count, data):
    for member in data:
        member_id = member["member_id"]
        if "'" in member["member_id"]:
            member_id = member_id.replace("'", "%27")
        # print("url: ", BASE_URL + DAIL_SEARCH_PARAMS + current_dail
        #       + MEMBER_PARAM + member_id)
        count = get_vote_count(BASE_URL + DAIL_SEARCH_PARAMS + current_dail
                               + MEMBER_PARAM + member_id)
        print("MEMBER: ", member["member_id"])
        print("count: ", count)
        percent = round((count / total_count) * 100, 2)
        print("percent: ", percent, "%")

        member["votes"] = count
        member["percentVotes"] = percent
        time.sleep(2)


def get_current_dail_info(info):
    response = requests.get('https://api.oireachtas.ie/v1/houses?chamber_id=&chamber=dail&limit=50', headers=headers)
    data = response.json()
    house_number = data["results"][0]["house"]["houseNo"]
    house_name = data["results"][0]["house"]["showAs"]
    seats = data["results"][0]["house"]["seats"]
    house_start_date = data["results"][0]["house"]["dateRange"]['start']
    info["currentDail"] = house_name
    info["dailStartDate"] = house_start_date
    return house_number, seats


def get_members(current_dail, seats, json_data):
    response = requests.get(
        'https://api.oireachtas.ie/v1/members?date_start=1900-01-01&chamber_id=&chamber=dail&house_no='
        + str(current_dail) + '&date_end=2099-01-01&limit=' + str(seats), headers=headers)
    data = response.json()

    member_array = []
    for result in data["results"]:

        holds_office = False
        for office in result["member"]["memberships"][0][
            "membership"]["offices"]:
            if office["office"]["dateRange"]["end"] is None and ("Minister for " in office["office"]["officeName"]["showAs"] or "Taoiseach" == office["office"]["officeName"]["showAs"]):
                holds_office = True
                break

        member_code = result["member"]["memberCode"]
        member_array.append(member_code)
        member_data = {}
        member_data["member_id"] = member_code
        member_data["fullName"] = result["member"]["fullName"]
        member_data["firstName"] = result["member"]["firstName"]
        member_data["lastName"] = result["member"]["lastName"]
        member_data["constituency"] = result["member"]["memberships"][0][
            "membership"]["represents"][-1]["represent"]["showAs"]
        member_data["party"] = result["member"]["memberships"][0][
            "membership"]["parties"][-1]["party"]["showAs"]
        member_data["office"] = holds_office

        finished_tenure = result["member"]["memberships"][0][
            "membership"]["dateRange"]["end"]
        if finished_tenure is None:
            json_data.append(member_data)
    return member_array


def get_parties(current_dail, info):
    response = requests.get(
        'https://api.oireachtas.ie/v1/parties?chamber_id=&chamber=dail&house_no='
        + str(current_dail) + '&limit=50', headers=headers)
    data = response.json()

    party_array = []
    for party in data["results"]["house"]["parties"]:
        print('party["party"]["showAs"]: ', party["party"]["showAs"])
        party_array.append({"value": party["party"]["partyCode"], "label": party["party"]["showAs"]})
    info["parties"] = party_array


def get_vote_count(url, vote_count=0):
    page = load_page(url)
    soup = BeautifulSoup(page.content, 'html.parser')

    content_start = soup.find("div", {"id": "content-start"})

    vote_count += len(content_start.findAll('div', class_="c-votes-list__item"))
    if vote_count == 20:
        try:
            ul = content_start.find('ul', class_="c-pagination__list")
            last_arrow = ul.findAll('a', class_="c-pagination__link -arrow")[-1]

            if last_arrow["title"] == "Go to last page":
                last_arrow_url = last_arrow["href"]
                page_count_text = last_arrow_url

                page_param = page_count_text.find('?page=')
                page_count_text = page_count_text[page_param:].replace("?page=", "")
                page_param_end = page_count_text.find('&')
                page_count = int(page_count_text[:page_param_end])

                vote_count *= (page_count - 1)
                vote_count = get_vote_count(BASE_URL + last_arrow_url, vote_count)
        except:
            print("issue finding arrow to go to last page.")
    return vote_count


def load_page(url):
    attempts = 0
    while attempts < 10:
        try:
            page = requests.get(url)
            if page.status_code == 200:
                return page
        except requests.exceptions.ConnectionError:
            print("Connection Error to URL: ", url)
        attempts += 1
        time.sleep(20)
        print("sleeping for 20")
    print("NOT WORKING FOR SOME REASON")
    print(url)
    return None


main()
