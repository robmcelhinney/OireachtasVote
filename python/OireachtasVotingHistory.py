#!/usr/bin/python3

import time
import requests
import json
from datetime import datetime
from statistics import median
import os

BASE_API_URL = "https://api.oireachtas.ie/v1/"

headers = {
    'Content-type': 'application/json',
}


def get_dail_count():
    response = requests.get("{}houses?chamber_id=&chamber=dail&limit=100".format(BASE_API_URL), headers=headers)
    data = response.json()
    num_members = data["head"]["counts"]["housesCount"]
    return num_members


def main():
    dail_count = get_dail_count()
    for dail_num in range(1, dail_count):
        data = []
        info = {}
        num_members = get_current_dail_info(info, dail_num)
        get_parties(dail_num, info)
        get_constituencies(dail_num, info)
        member_show_as_code_to = get_member_show_as_to_code(dail_num,
                num_members, info)
        (total_count, member_vote_track, member_vote_day_track, total_days,
                separate_dates) = get_vote_count(info, member_show_as_code_to)
        get_members(dail_num, num_members, data, info, total_count,
                separate_dates)
        get_member_percent(total_count, data, member_vote_track,
                member_vote_day_track, total_days)
        create_averages(data, info)
        create_json(data, info, total_count)
        time.sleep(1)


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

    directory = "src/data"
    if not os.path.exists(directory):
        os.makedirs(directory)

    with open(directory + "/" + str(info["dail"]) + 'members.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

    with open(directory + "/" + str(info["dail"]) + 'info.json', 'w', encoding='utf-8') as f:
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
        if member["total_votes"] is None:
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


def get_current_dail_info(info, dail_num):
    response = requests.get("{}houses?chamber_id=&chamber=dail&limit=50".format(BASE_API_URL), headers=headers)
    data = response.json()
    count = data["head"]["counts"]["resultCount"]

    house_start_date = data["results"][count - dail_num]["house"]["dateRange"]['start']
    house_end_date = data["results"][count - dail_num]["house"]["dateRange"]['end']
    info["dailStartDate"] = house_start_date
    info["dailEndDate"] = house_end_date or "2099-01-01"
    info["dail"] = dail_num

    response = requests.get(
            "{}members?date_start=1900-01-01&chamber_id=&chamber=dail&"
            "house_no={}&date_end={}&limit=1".format(BASE_API_URL,
            dail_num, info["dailEndDate"]), headers=headers)
    data = response.json()
    num_members = data["head"]["counts"]["resultCount"]
    return num_members


def get_members(current_dail, num_members, json_data, info, total_count, separate_dates):
    response = requests.get(
            "{}members?date_start=1900-01-01&chamber_id=&chamber=dail&house_no={}&"
            "date_end={}&limit={}".format(BASE_API_URL, str(current_dail),
            info["dailEndDate"], str(num_members)), headers=headers)
    data = response.json()

    for result in data["results"]:
        holds_office = False
        for office in result["member"]["memberships"][0][
            "membership"]["offices"]:
            #TODO: this will only get the current Taoiseach.
            if office["office"]["dateRange"]["end"] is None and (
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
        if (datetime.strptime(start_date, "%Y-%m-%d") >
                datetime.strptime(info["dailStartDate"], "%Y-%m-%d")):
            # print("new member: ", member_data["fullName"])
            total_votes = check_possible_votes(total_count, info, start_date)
            total_days = check_possible_days_start(separate_dates, start_date)
            member_data["total_votes"] = total_votes
            member_data["total_days"] = total_days
        # Check if members have left in middle of Dáil session.
        elif (finished_tenure is not None and
                (datetime.strptime(finished_tenure, "%Y-%m-%d") <
                datetime.strptime(info["dailEndDate"], "%Y-%m-%d"))):
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
            "{}members?date_start=1900-01-01&chamber_id=&chamber=dail"
            "&house_no={}&date_end={}&limit={}".format(BASE_API_URL,
            str(current_dail), info["dailEndDate"], str(num_members)),
            headers=headers)
    data = response.json()
    member_show_as_code_to = {}
    for result in data["results"]:
        member_code = result["member"]["memberCode"]
        full_name = result["member"]["fullName"]
        member_show_as_code_to[full_name.lower()] = member_code
    return member_show_as_code_to


def check_possible_votes(total_count, info, start_date=None, end_date=None):
    if start_date is None:
        start_date = info["dailStartDate"]
    if end_date is None:
        end_date = info["dailEndDate"]
    response = requests.get(
            "{}divisions?chamber_type=house&chamber_id=&chamber=dail&"
            "date_start={}&date_end={}&skip={}&limit=1&outcome=".format(
            BASE_API_URL, start_date, end_date, total_count),
            headers=headers)
    data = response.json()
    possible_votes = data["head"]["counts"]["resultCount"]
    return possible_votes


def check_possible_days_start(separate_dates, start_date):
    days = 0
    for date in separate_dates:
        if (datetime.strptime(date, "%Y-%m-%d") >
                datetime.strptime(start_date, "%Y-%m-%d")):
            days += 1
    return days


def check_possible_days_end(separate_dates, end_date):
    days = 0
    for date in separate_dates:
        if (datetime.strptime(date, "%Y-%m-%d") <
                datetime.strptime(end_date, "%Y-%m-%d")):
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


def get_vote_count(info, member_show_as_code_to):
    response = requests.get(
        "{}divisions?chamber_type=house&chamber_id=&chamber=dail&"
        "date_start={}&date_end={}&limit=1&outcome=".format(BASE_API_URL,
        info["dailStartDate"], info["dailEndDate"]), headers=headers)
    response_data = response.json()
    total_votes = int(response_data["head"]["counts"]["resultCount"])

    member_vote_track = {}
    member_vote_day_track = {}
    print('info["dailStartDate"]: ', info["dailStartDate"])
    print('info["dail"]: ', info["dail"])
    print('total_votes: ', total_votes)
    print("{}divisions?".format(BASE_API_URL) +
            "chamber_type=house&chamber_id=&chamber=dail&"
            "date_start=" + info["dailStartDate"] +
            "&date_end=" + info["dailEndDate"] + "&limit=" +
            str(total_votes) + "&outcome=")
    response = requests.get("{}divisions?chamber_type=house&chamber_id="
            "&chamber=dail&date_start={}&date_end={}&limit={}&outcome=".
            format(BASE_API_URL, info["dailStartDate"], info["dailEndDate"],
            str(total_votes)), headers=headers)

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
                if members["member"]["memberCode"] is None:
                    if members["member"] is None:
                        print("Something went wrong (with Oireachtas.ie's data)"
                              " and the memberCode && member are not "
                              "showing but this is the name of the "
                              "member voting: ")
                    else:
                        member_name = (members["member"]["showAs"]).lower()
                        if member_name in member_show_as_code_to:
                            members["member"]["memberCode"] = (
                                    member_show_as_code_to[member_name])
                        else:
                            # Reorder name in case using
                            # LastName, FirstName order.
                            reordered_name = " ".join(member_name.split(", ")[1:]) + " " + member_name.split(", ")[0]
                            # print("reordered_name: ", reordered_name)
                            if reordered_name in member_show_as_code_to:
                                members["member"]["memberCode"] = (
                                    member_show_as_code_to[reordered_name])
                            else:
                                # Remove fullstops from name.
                                # reordered_name = reordered_name.replace(".", "")
                                reordered_name = reverse_replace(
                                        reordered_name, ".", "", 1)
                                if reordered_name in member_show_as_code_to:
                                    members["member"]["memberCode"] = (
                                        member_show_as_code_to[reordered_name])
                                else:
                                    print("Something went wrong (with Oireachtas.ie's data)"
                                            " and the memberCode is not "
                                            "showing but this is the name of the "
                                            "member: {}".format(reordered_name))
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


def reverse_replace(s, old, new, occurrence):
    li = s.rsplit(old, occurrence)
    return new.join(li)


main()
