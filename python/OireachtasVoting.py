#!/usr/bin/python3

import time
import requests
import json
from datetime import datetime
from statistics import median

BASE_API_URL = "https://api.oireachtas.ie/v1/"

DAIL_SEARCH_PARAMS = ("/en/debates/votes/?voteResultType=all&debateType="
        "dail&datePeriod=term&term=%2Fie%2Foireachtas%2Fhouse%2Fdail%2F")

BASE_URL = "https://www.oireachtas.ie"
MEMBER_PARAM = "&committee=&member=%2Fie%2Foireachtas%2Fmember%2Fid%2F"

headers = {
    'Content-type': 'application/json',
}


def main():
    data = []
    info = {}

    current_dail, num_members = get_current_dail_info(info)
    get_parties(current_dail, info)
    get_constituencies(current_dail, info)
    total_count, member_vote_track, member_vote_day_track, total_days, separate_dates = get_vote_count(info)
    get_members(current_dail, num_members, data, info, total_count, separate_dates)
    get_member_percent(total_count, data, member_vote_track, member_vote_day_track, total_days)
    create_averages(data, info)
    create_json(data, info, total_count)


def create_averages(data, info):
    parties_votes = {}
    for member in data:
        if member["percentVotes"] == 0:
            continue
        if member['party'] in parties_votes:
            parties_votes[member['party']].append(member["percentVotes"])
        else:
            parties_votes[member['party']] = [member["percentVotes"]]

    parties_averages = {}
    for party in info["parties"]:
        party = party['label']
        if party in parties_votes:
            average = (sum(parties_votes[party]) /
                    len(parties_votes[party]))
            average = round(average, 2)
            parties_averages[party] = average
    parties_median = {}
    for party in info["parties"]:
        party = party['label']
        if party in parties_votes:
            median_value = median(parties_votes[party])
            median_value = round(median_value, 2)
            parties_median[party] = median_value
    info["partyAverages"] = parties_averages
    info["partyMedian"] = parties_median


def create_json(data, info, count):
    now = datetime.now()
    info["totalVotes"] = count
    info["dateCreated"] = now.strftime("%d/%m/%Y %H:%M:%S")

    with open('../src/members.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

    with open('../src/info.json', 'w', encoding='utf-8') as f:
        json.dump(info, f, ensure_ascii=False, indent=4)


def get_member_percent(total_count, data, member_vote_track, member_vote_day_track, total_days):
    for member in data:
        member_id = member["member_id"]
        if member_id in member_vote_track:
            count = member_vote_track[member_id]
        else:
            count = 0
        if member_id in member_vote_day_track:
            day_count = member_vote_day_track[member_id]
        else:
            day_count = 0
        if member["total_votes"] is None:
            percent = round((count / total_count) * 100, 2)
            percent_days = round((day_count / total_days) * 100, 2)
        else:
            if member["total_votes"] == 0:
                percent = 0
            else:
                percent = round((count / member["total_votes"]) * 100, 2)
            percent_days = round((day_count / member["total_days"]) * 100, 2)
        member["votes"] = count
        member["percentVotes"] = percent
        member["percent_days"] = percent_days


def get_current_dail_info(info):
    response = requests.get("{}houses?chamber_id=&chamber=dail&limit=50".format(BASE_API_URL), headers=headers)
    data = response.json()
    house_number = data["results"][0]["house"]["houseNo"]
    house_name = data["results"][0]["house"]["showAs"]
    # current_seats = data["results"][0]["house"]["seats"]
    house_start_date = data["results"][0]["house"]["dateRange"]['start']
    info["currentDail"] = house_name
    info["dailStartDate"] = house_start_date

    response = requests.get(
        "{}members?date_start=1900-01-01&chamber_id=&chamber=dail&house_no=32&date_end=2099-01-01&limit=1".format(BASE_API_URL), headers=headers)
    data = response.json()
    num_members = data["head"]["counts"]["resultCount"]

    return house_number, num_members


def get_members(current_dail, num_members, json_data, info, total_count, separate_dates):
    response = requests.get(
        "{}members?date_start=1900-01-01&chamber_id=&chamber=dail&house_no=".format(BASE_API_URL)
        + str(current_dail) + "&date_end=2099-01-01&limit=" + str(num_members), headers=headers)
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

        start_date = result["member"]["memberships"][0]["membership"][
                "dateRange"]["start"]

        if (datetime.strptime(start_date, "%Y-%m-%d") >
                datetime.strptime(info["dailStartDate"], "%Y-%m-%d")):
            # print("new member: ", member_data["fullName"])
            total_votes = check_possible_votes(start_date, total_count)
            total_days = check_possible_days(start_date, separate_dates)
            member_data["total_votes"] = total_votes
            member_data["total_days"] = total_days
        else:
            member_data["total_votes"] = None
            member_data["total_days"] = None

        finished_tenure = result["member"]["memberships"][0][
            "membership"]["dateRange"]["end"]
        if finished_tenure is None:
            json_data.append(member_data)
    return member_array


def check_possible_votes(start_date, total_count):
    response = requests.get(
        "{}divisions?chamber_type=house&chamber_id=&chamber=dail&"
        "date_start={}&date_end=2099-01-01&skip={}&limit=1&outcome=".format(
            BASE_API_URL, start_date, total_count), headers=headers)
    data = response.json()
    possible_votes = data["head"]["counts"]["resultCount"]
    return possible_votes


def check_possible_days(start_date, separate_dates):
    days = 0
    # print("start_date: ", start_date)
    for date in separate_dates:
        if (datetime.strptime(date, "%Y-%m-%d") >
                datetime.strptime(start_date, "%Y-%m-%d")):
            # print("date: ", date)
            days += 1
    return days


def get_parties(current_dail, info):
    response = requests.get(
        "{}parties?chamber_id=&chamber=dail&house_no=".format(BASE_API_URL)
        + str(current_dail) + '&limit=50', headers=headers)
    data = response.json()

    party_array = []
    for party in data["results"]["house"]["parties"]:
        party_array.append({"value": party["party"]["partyCode"], "label": party["party"]["showAs"]})
    info["parties"] = party_array


def get_constituencies(current_dail, info):
    response = requests.get(
        "{}constituencies?chamber_id=&chamber=dail&house_no=".format(BASE_API_URL)
        + str(current_dail) + '&limit=50', headers=headers)
    data = response.json()

    constituency_array = []
    for constituency in data["results"]["house"]["constituenciesOrPanels"]:
        constituency_array.append(constituency['constituencyOrPanel']['showAs'])
    info["constituencies"] = constituency_array

def get_vote_count(info):
    response = requests.get(
        "{}divisions?chamber_type=house&chamber_id=&chamber=dail&date_start=".format(BASE_API_URL)
        + info["dailStartDate"] + "&date_end=2099-01-01&limit=1&outcome=", headers=headers)
    response_data = response.json()
    total_votes = int(response_data["head"]["counts"]["resultCount"])

    member_vote_track = {}
    member_vote_day_track = {}
    response = requests.get("{}divisions?".format(BASE_API_URL) +
                            "chamber_type=house&chamber_id=&chamber=dail&date_start="
                            + info["dailStartDate"] + "&date_end=2099-01-01&limit=" +
                            str(total_votes) + "&outcome=", headers=headers)

    response_data = response.json()
    results = response_data["results"]
    separate_dates = []
    total_days = 0
    for result in results:
        date = datetime.strptime(result["contextDate"], '%Y-%m-%d')
        if (result["contextDate"] not in separate_dates and
                date.weekday() == 3):
            separate_dates.append(result["contextDate"])
            members_votes(result["division"]["tallies"], member_vote_track, member_vote_day_track)
            total_days += 1
        else:
            members_votes(result["division"]["tallies"], member_vote_track)

    return total_votes, member_vote_track, member_vote_day_track, total_days, separate_dates


def members_votes(tallies_data, member_vote_track, member_vote_day_track=None):
    for voteType in ["nilVotes", "taVotes", "staonVotes"]:
        if tallies_data[voteType]:
            for members in tallies_data[voteType]["members"]:
                if members['member']["memberCode"] is None:
                    print("Something went wrong (with Oireachtas.ie's data)"
                          " and the memberCode is not showing but this "
                          "is the name of the member voting: "
                          "members['member']: ", members['member'])
                if members['member']["memberCode"] in member_vote_track:
                    member_vote_track[members['member']["memberCode"]] += 1
                else:
                    member_vote_track[members['member']["memberCode"]] = 1
                if member_vote_day_track is not None:
                    if members['member']["memberCode"] in member_vote_day_track:
                        member_vote_day_track[members['member']["memberCode"]] += 1
                    else:
                        member_vote_day_track[members['member']["memberCode"]] = 1


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
