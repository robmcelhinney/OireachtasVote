#!/usr/bin/python3

import requests
import json
from datetime import datetime
from statistics import median
import os

BASE_API_URL = "https://api.oireachtas.ie/v1/"
CHAMBER_DAIL = "chamber=dail"
Y_M_D_format = "%Y-%m-%d"

headers = {
    'Content-type': 'application/json',
}


def main():
    data = []
    info = {}
    current_dail, num_members = get_current_dail_info(info)
    get_parties(current_dail, info)
    get_constituencies(current_dail, info)
    member_show_as_code_to = get_member_show_as_to_code(current_dail,
                num_members, info)
    (total_count, member_vote_track, member_vote_day_track, total_days,
            separate_dates) = get_vote_count(info, member_show_as_code_to)
    get_members(current_dail, num_members, data, info, total_count,
            separate_dates)
    get_member_percent(total_count, data, member_vote_track,
            member_vote_day_track, total_days)
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

    # sort values
    info["partyMedian"] = {k: v for k, v in sorted(info["partyMedian"].items(), key=lambda item: item[1])}
    info["partyAverages"] = {k: v for k, v in sorted(info["partyAverages"].items(), key=lambda item: item[1])}

def create_json(data, info, count):
    now = datetime.now()
    info["totalVotes"] = count
    info["dateCreated"] = now.strftime("%d/%m/%Y %H:%M:%S")

    directory = "src/data"
    if not os.path.exists(directory):
        os.makedirs(directory)

    with open(directory + "/" + str(info["dail"]) + 'members.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    with open('src/members.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

    with open(directory + "/" + str(info["dail"]) + 'info.json', 'w', encoding='utf-8') as f:
        json.dump(info, f, ensure_ascii=False, indent=4)
    with open('src/info.json', 'w', encoding='utf-8') as f:
        json.dump(info, f, ensure_ascii=False, indent=4)


def get_member_percent(total_count, data, member_vote_track,
        member_vote_day_track, total_days):
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
        if not member["total_votes"]:
            percent = 0
            if not (count == 0 or total_count == 0):
                percent = round((count / total_count) * 100, 2)
            percent_days = 0
            if not (day_count == 0 or total_days == 0):
                percent_days = round((day_count / total_days) * 100, 2)
        else:
            if member["total_votes"] == 0:
                percent = 0
            else:
                percent = round((count / member["total_votes"]) * 100, 2)
            percent_days = 0
            if member["total_days"] != 0:
                percent_days = round((day_count / member["total_days"]) * 100, 2)
        member["votes"] = count
        member["percentVotes"] = percent
        member["percent_days"] = percent_days


def get_current_dail_info(info):
    response = requests.get("{}houses?{}&limit=50".format(BASE_API_URL, CHAMBER_DAIL), headers=headers)
    data = response.json()
    house_number = data["results"][0]["house"]["houseNo"]

    house_start_date = data["results"][0]["house"]["dateRange"]['start']
    house_end_date = data["results"][0]["house"]["dateRange"]['end']
    info["dailStartDate"] = house_start_date
    info["dailEndDate"] = house_end_date or "2099-01-01"
    info["dail"] = int(house_number)

    response = requests.get(
            "{}members?date_start=1900-01-01&{}&"
            "house_no={}&date_end={}&limit=1".format(BASE_API_URL, 
            CHAMBER_DAIL, house_number, info["dailEndDate"]), headers=headers)
    data = response.json()
    num_members = data["head"]["counts"]["resultCount"]
    return house_number, num_members


def get_members(current_dail, num_members, json_data, info, total_count, separate_dates):
    response = requests.get(
            "{}members?date_start=1900-01-01&{}&house_no={}&"
            "date_end={}&limit={}".format(BASE_API_URL, CHAMBER_DAIL,
            str(current_dail), info["dailEndDate"], str(num_members)), 
            headers=headers)
    data = response.json()

    for result in data["results"]:
        holds_office = False
        for office in result["member"]["memberships"][0][
            "membership"]["offices"]:
            if not office["office"]["dateRange"]["end"] and (
                    "Minister for " in office["office"]["officeName"]["showAs"] or "Taoiseach" ==
                    office["office"]["officeName"]["showAs"]):
                holds_office = True
                break

        member_code = result["member"]["memberCode"]
        member_data = {}
        member_data["member_id"] = member_code
        member_data["fullName"] = result["member"]["fullName"]
        member_data["firstName"] = result["member"]["firstName"]
        member_data["lastName"] = result["member"]["lastName"]
        if (result["member"]["memberships"][0]["membership"][
                "represents"] != []):
            member_data["constituency"] = result["member"]["memberships"][0][
                    "membership"]["represents"][-1]["represent"]["showAs"]
        member_data["party"] = result["member"]["memberships"][0][
                "membership"]["parties"][-1]["party"]["showAs"]
        member_data["office"] = holds_office
        member_data["votes"] = 0

        start_date = result["member"]["memberships"][0]["membership"][
                "dateRange"]["start"]
        finished_tenure = result["member"]["memberships"][0][
                "membership"]["dateRange"]["end"]

        # Check if members have joined in middle of Dáil session.
        if (datetime.strptime(start_date, Y_M_D_format) >
                datetime.strptime(info["dailStartDate"], Y_M_D_format)):
            # print("new member: ", member_data["fullName"])
            total_votes = check_possible_votes(total_count, info, start_date)
            total_days = check_possible_days_start(separate_dates, start_date)
            member_data["total_votes"] = total_votes
            member_data["total_days"] = total_days
        # Check if members have left in middle of Dáil session.
        elif (finished_tenure is not None and
                (datetime.strptime(finished_tenure, Y_M_D_format) <
                datetime.strptime(info["dailEndDate"], Y_M_D_format))):
            total_votes = check_possible_votes(total_count, info,
                    end_date=finished_tenure)
            total_days = check_possible_days_end(separate_dates,
                    finished_tenure)
            member_data["total_votes"] = total_votes
            member_data["total_days"] = total_days
        else:
            member_data["total_votes"] = None
            member_data["total_days"] = None

        json_data.append(member_data)


def get_member_show_as_to_code(current_dail, num_members, info):
    response = requests.get(
            "{}members?date_start=1900-01-01&{}"
            "&house_no={}&date_end={}&limit={}".format(BASE_API_URL,
            CHAMBER_DAIL, str(current_dail), info["dailEndDate"], 
            str(num_members)), headers=headers)
    data = response.json()
    member_show_as_code_to = {}
    for result in data["results"]:
        member_code = result["member"]["memberCode"]
        member_show_as_code_to[result["member"]["fullName"]] = member_code
    return member_show_as_code_to


def check_possible_votes(total_count, info, start_date=None, end_date=None):
    if not start_date:
        start_date = info["dailStartDate"]
    if not end_date:
        end_date = info["dailEndDate"]
    response = requests.get(
            "{}divisions?chamber_type=house&{}&"
            "date_start={}&date_end={}&skip={}&limit=1&outcome=".format(
            BASE_API_URL, CHAMBER_DAIL, start_date, end_date, total_count),
            headers=headers)
    data = response.json()
    possible_votes = data["head"]["counts"]["resultCount"]
    return possible_votes


def check_possible_days_start(separate_dates, start_date):
    days = 0
    for date in separate_dates:
        if (datetime.strptime(date, Y_M_D_format) >
                datetime.strptime(start_date, Y_M_D_format)):
            days += 1
    return days


def check_possible_days_end(separate_dates, end_date):
    days = 0
    for date in separate_dates:
        if (datetime.strptime(date, Y_M_D_format) <
                datetime.strptime(end_date, Y_M_D_format)):
            days += 1
    return days


def get_parties(current_dail, info):
    response = requests.get(
        "{}parties?{}&house_no=".format(BASE_API_URL, CHAMBER_DAIL)
        + str(current_dail) + '&limit=100', headers=headers)
    data = response.json()

    party_array = []
    for party in data["results"]["house"]["parties"]:
        party_array.append({"value": party["party"]["partyCode"], "label": party["party"]["showAs"]})
    info["parties"] = party_array


def get_constituencies(current_dail, info):
    response = requests.get(
        "{}constituencies?{}&house_no=".format(BASE_API_URL, CHAMBER_DAIL)
        + str(current_dail) + '&limit=100', headers=headers)
    data = response.json()

    constituency_array = []
    for constituency in data["results"]["house"]["constituenciesOrPanels"]:
        constituency_array.append(constituency['constituencyOrPanel']['showAs'])
    info["constituencies"] = constituency_array


def get_vote_count(info, member_show_as_code_to):
    response = requests.get(
        "{}divisions?chamber_type=house&{}&"
        "date_start={}&date_end={}&limit=1&outcome=".format(BASE_API_URL,
        CHAMBER_DAIL, info["dailStartDate"], info["dailEndDate"]), 
        headers=headers)
    response_data = response.json()
    total_votes = int(response_data["head"]["counts"]["resultCount"])

    member_vote_track = {}
    member_vote_day_track = {}
    print('vote count')
    print('info["dailStartDate"]: ', info["dailStartDate"])
    print('info["dail"]: ', info["dail"])
    print('total_votes: ', total_votes)
    print("url: {}divisions?chamber_type=house&{}&"
            "date_start={}&date_end={}&limit={}"
            "&outcome=".format(BASE_API_URL, CHAMBER_DAIL, 
            info["dailStartDate"], info["dailEndDate"], str(total_votes)))
    response = requests.get("{}divisions?chamber_type=house"
            "&{}&date_start={}&date_end={}&limit={}&outcome=".
            format(BASE_API_URL, CHAMBER_DAIL, info["dailStartDate"], 
            info["dailEndDate"], str(total_votes)), headers=headers)

    response_data = response.json()
    results = response_data["results"]
    separate_dates = []
    total_days = 0
    for result in results:
        date = datetime.strptime(result["contextDate"], '%Y-%m-%d')
        if (result["contextDate"] not in separate_dates and
                date.weekday() == 3):
            separate_dates.append(result["contextDate"])
            members_votes(result["division"]["tallies"], member_show_as_code_to,
                    member_vote_track, member_vote_day_track)
            total_days += 1
        else:
            members_votes(result["division"]["tallies"], member_show_as_code_to,
                    member_vote_track)

    return (total_votes, member_vote_track, member_vote_day_track,
            total_days, separate_dates)


def members_votes(tallies_data, member_show_as_code_to, member_vote_track,
        member_vote_day_track=None):
    for voteType in ["nilVotes", "taVotes", "staonVotes"]:
        if tallies_data[voteType]:
            for members in tallies_data[voteType]["members"]:
                if not members["member"]["memberCode"]:
                    if not members["member"]:
                        print("Something went wrong (with Oireachtas.ie's data) "
                              "and the memberCode && member are not "
                              "showing but this is the name of the "
                              "member voting: ")
                    else:
                        # print('members["member"]["showAs"]: ', members["member"]["showAs"])
                        # print('member_show_as_code_to: ', member_show_as_code_to)
                        member_name = members["member"]["showAs"].replace(
                                ".", "")
                        if member_name in member_show_as_code_to:
                            members["member"]["memberCode"] = (
                                    member_show_as_code_to[member_name])
                        # else:
                        #     print("Something went wrong (with Oireachtas.ie's data)"
                        #           " and the memberCode is not "
                        #           "showing but this is the name of the "
                        #           "member: ", members["member"])
                if members["member"]["memberCode"] in member_vote_track:
                    member_vote_track[members["member"]["memberCode"]] += 1
                else:
                    member_vote_track[members["member"]["memberCode"]] = 1
                if member_vote_day_track is not None:
                    if members["member"]["memberCode"] in member_vote_day_track:
                        member_vote_day_track[members["member"][
                                "memberCode"]] += 1
                    else:
                        member_vote_day_track[members["member"][
                                "memberCode"]] = 1


main()
