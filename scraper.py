import requests
from bs4 import BeautifulSoup
import pandas as pd

URL = 'https://gparchive.com/events/index/'
page = requests.get(URL)

soup = BeautifulSoup(page.content, 'html.parser')
i = 0
all_race_results = []
race_names = []
table_headers = ['Pos.', 'Driver', 'Team', 'Laps', 'Gap', 'Points']

# Find the table with id 'tablepress-GPevents'
table = soup.find('table', {'id': 'tablepress-GPevents'})

if table:
    # Find all td tags within the table
    td_tags = table.find_all('td', class_='column-1')

    # Loop through each td tag
    for td in td_tags:
        # Find all a tags within the current td tag
        a_tags = td.find_all('a')
        # Print the text and href attribute of each a tag
        for a in a_tags:
            gpURL = a.get('href')
            gpPage = requests.get(gpURL)
            gpSoup = BeautifulSoup(gpPage.content, 'html.parser')
            gp_table = gpSoup.find('table', {'class':'tablepress'})

            if gp_table:
                gp_td_tags = gp_table.find_all('td', class_='column-1')

                for gp_td in gp_td_tags:
                    gp_a_tags = gp_td.find_all('a')
                    for gp_a in gp_a_tags:
                            race_url = gp_a.get('href')
                            race_page = requests.get(race_url)
                            race_soup = BeautifulSoup(race_page.content, 'html.parser')
                            race_table = race_soup.find('table', {'class':'tablepress'})

                            if race_table:
                                race_table_head = race_table.find('thead')
                                race_head_cols = race_table_head.find('tr').find_all('th')
                                table_index = []
                                for index, col in enumerate(race_head_cols):
                                    if col.text in table_headers:
                                        table_index.append(index)

                                race_table_body = race_table.find('tbody')
                                race_tr_tags = race_table_body.find_all('tr')

                                race_results = []

                                for race_tr in race_tr_tags:
                                    race_td_tags = race_tr.find_all('td')
                                    race_result = []

                                    for col_index, race_td in enumerate(race_td_tags):
                                        if (col_index in table_index):
                                            race_result.append(race_td.text.strip())        

                                    race_results.append(race_result)

                                race_name = race_url.split('/')[4]
                                race_names.append(race_name)
                                all_race_results.append(race_results)

                                print(race_name)
else:
    print("Table not found.")

print('------------PARSING COMPLETE------------')

with pd.ExcelWriter('all_race_results_2.xlsx') as writer:
    for race_name, race_result in zip(race_names, all_race_results):
        df = pd.DataFrame(race_result)
        df.to_excel(writer, sheet_name=race_name, index=False, header=False) 