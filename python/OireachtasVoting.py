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
    get_members(current_dail, seats, data)
    count, member_vote_track = get_vote_count(info)
    get_member_percent(count, data, member_vote_track)
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


def get_member_percent(total_count, data, member_vote_track):
    for member in data:
        member_id = member["member_id"]
        if member_id in member_vote_track:
            count = member_vote_track[member_id]
        else:
            count = 0
        percent = round((count / total_count) * 100, 2)
        # print("percent: ", percent, "%")
        member["votes"] = count
        member["percentVotes"] = percent


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
            if office["office"]["dateRange"]["end"] is None and (
                    "Minister for " in office["office"]["officeName"]["showAs"] or "Taoiseach" ==
                    office["office"]["officeName"]["showAs"]):
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
        member_data["votes"] = 0

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


def get_vote_count(info):
    response = requests.get(
        'https://api.oireachtas.ie/v1/divisions?chamber_type=house&chamber_id=&chamber=dail&date_start='
        + info["dailStartDate"] + '&date_end=2099-01-01&limit=1&outcome=', headers=headers)
    response_data = response.json()
    total_votes = int(response_data["head"]["counts"]["resultCount"])

    print("get_vote_count 2")

    member_vote_track = {}
    response = requests.get('https://api.oireachtas.ie/v1/divisions?'
                            'chamber_type=house&chamber_id=&chamber=dail&date_start='
                            + info["dailStartDate"] + '&date_end=2099-01-01&limit=' +
                            str(total_votes) + '&outcome=', headers=headers)
    print("get_vote_count 3. received long response")

    response_data = response.json()
    results = response_data["results"]
    for result in results:
        members_votes(result["division"]["tallies"], member_vote_track)
    print("member_vote_track: ", member_vote_track)

    return total_votes, member_vote_track


def members_votes(tallies_data, member_vote_track):
    for voteType in ["nilVotes", "taVotes", "staonVotes"]:
        if tallies_data[voteType]:
            for members in tallies_data[voteType]["members"]:
                if members['member']["memberCode"] == None:
                    print("NONE???")
                    print("members['member'][memberCode]: ", members['member']["memberCode"])
                if members['member']["memberCode"] in member_vote_track:
                    member_vote_track[members['member']["memberCode"]] += 1
                else:
                    member_vote_track[members['member']["memberCode"]] = 1


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
