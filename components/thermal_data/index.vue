<template>
  <v-container class="h-100 w-80 bg-slate-10">
    <v-form v-model="valid" ref="form">
      <v-row>
        <!-- Loop through formFields for text fields -->
        <v-col cols="12" md="6" v-for="field in formFields" :key="field.key">
          <v-text-field
            v-model="form[field.key]"
            :label="field.label"
            :rules="[rules.required]"
            :type="field.type"
          ></v-text-field>
        </v-col>
        <!-- Custom v-select for permissionsToCopy -->
        <v-col cols="12" md="6" v-for="selection in form_with_options" :key="selection.key">
          <v-select
            :label="selection.label"
            variant="underlined"
            no-data-text="Empty"
            :items="selection.options"
            v-model="form[selection.key]"
            return-object
          >
            <template v-slot:selection="{ item, props }">
              <v-list-item v-bind="props" style="padding: 0;" :title="convertToReadableText(item)"></v-list-item>
            </template>
            <template v-slot:item="{ item, props }">
              <v-list-item v-bind="props" :title="convertToReadableText(item)"></v-list-item>
            </template>
          </v-select>
        </v-col>
        <v-col cols="12">
          <v-btn elevation="2" color="secondary" :loading="loading" :disabled="loading" @click.prevent="submitForm">Submit</v-btn>
        </v-col>
      </v-row>
    </v-form>
    <br/>

    <v-card
      title=""
      flat
    >
      <template v-slot:text>
        <v-row>
          <v-col cols="12" md="5">
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="5"></v-col>
          <v-col cols="12" md="2">
            <v-btn elevation="2" color="secondary">
            <a class="btn btn-blue" :href="download_url" download="thermal_data.csv">{{ envs }} Export to CSV</a>
            </v-btn>
          </v-col>
        </v-row>
      </template>

      <v-data-table
        :headers="headers"
        :items="serverItems"
        :items-per-page="itemsPerPage"
        :loading="loading"
        :sortable="true"
        :search="search"
      >
        <template v-slot:item.participant="{ item }">
          <div class="text-end">({{ item.participant}}). {{ participants?.filter(participant => participant.id == item.participant)[0].gender }}</div>
        </template>

        <template v-slot:item.comfort_point="{ item }">
          <div class="text-center"> {{ form_with_options.find(i => i.key === "comfort_point")?.options.find(j => j.id == item.comfort_point)?.description }} </div>
        </template>

        <template v-slot:item.created_date="{ item }">
          <div class="text-center">{{ item.created_date.split("T")[0] }}</div>
        </template>

        <template v-slot:item.ger="{ item }">
          <div class="text-center "> {{ form_with_options.find(i => i.key === "ger")?.options.find(j => j.id == item.ger)?.name }} </div>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script lang="ts">

import { decodeToken } from "~/utils/jwt.js";

export default {
  middleware: 'auth',
  data() {
    return {
      valid: false,
      search: '',
      form: {
        comfort_point: null,
        ger: '',
        timestamp: '',
        weather_condition: '',
        inside_temperature: '',
        inside_humidity: '',
        outside_temperature: '',
        outside_humidity: '',
        heart_rate: '',
        skin_temperature: '',
        metabolic_rate: '',
        // activity_level: '',
        clothing_level: '',
        sleep_point: '',
        is_user_come_in: '',
        is_door_open: '',
        is_brim_open: '',
        envv: process.env.NODE_ENV,
      },
      formFields: [
        { key: 'inside_temperature', label: 'Inside Temperature', type: 'number', },
        { key: 'inside_humidity', label: 'Inside Humidity', type: 'number'},
        { key: 'outside_temperature', label: 'Outside Temperature', type: 'number'},
        { key: 'outside_humidity', label: 'Outside Humidity', type: 'number'},
        { key: 'heart_rate', label: 'Heart Rate', type: 'number'},
        { key: 'skin_temperature', label: 'Skin Temperature', type: 'number'},
        { key: 'metabolic_rate', label: 'Metabolic Rate', type: 'number'},
        // { key: 'activity_level', label: 'Activity Level', type: 'number'},
        { key: 'sleep_point', label: 'Sleep Point', type: 'number'},
      ],
      form_with_options: [
        { 
          key: 'comfort_point', 
          label: 'Comfort Point', 
          options: [
            { id: -3, description: "Cold" },
            { id: -2, description: "Cool" },
            { id: -1, description: "Slightly Cool" },
            { id: 0, description: "Neutral" },
            { id: 1, description: "Slightly Warm" },
            { id: 2, description: "Warm" },
            { id: 3, description: "Hot" }
          ]
        },
        { 
          key: 'ger', 
          label: 'Ger', 
          options: [
            {
              "id": 1,
              "name": "Ger 1",
              "description": "With an iron roof and cement floor, Ger is located in the forest."
            },
            {
              "id": 2,
              "name": "Ger 2",
              "description": "Traditional Ger is located in the countryside."
            }
          ]
        },
        { key: 'timestamp', label: 'Timestamp', options: []},
        { key: 'is_brim_open', label: 'Is Brim open', options: [{"id": true, "description": "Yes"}, {"id": false, "description": "No"}]},
        { key: 'is_door_open', label: 'Is Door Open', options: [{"id": true, "description": "Yes"}, {"id": false, "description": "No"}] },
        { key: 'is_user_come_in', label: 'Is User Come In', options: [{"id": true, "description": "Yes"}, {"id": false, "description": "No"}] },
        { key: 'is_window_open', label: 'Is Window Open', options: [{"id": true, "description": "Yes"}, {"id": false, "description": "No"}] },
        { key: 'weather_condition', label: 'Weather Condition', options: [
          {"id": "Clear", "description": "Clear"}, 
          {"id": "Cloudy", "description": "Cloudy"}, 
          {"id": "Sunny", "description": "Sunny"}, 
          {"id": "Foggy", "description": "Foggy"}, 
          {"id": "Rainy", "description": "Rainy"}, 
          {"id": "Windy", "description": "Windy"}
        ]},
        { key: 'clothing_level', label: 'Clothing Level', options: [
            {"description": "Walking shorts, short-sleeved shirt", "id": 0.36},
            {"description": "Knee-length skirt, short-sleeved shirt, panty hose, sandals", "id": 0.54},
            {"description": "Trousers, short-sleeved shirt", "id": 0.57},
            {"description": "Trousers, long-sleeved shirt", "id": 0.61},
            {"description": "Knee-length skirt, long-sleeved shirt, full slip, panty hose", "id": 0.67},
            {"description": "Long-sleeved coveralls, T-shirt", "id": 0.72},
            {"description": "Sweat pants, sweat shirt", "id": 0.74},
            {"description": "Overalls, long-sleeved shirt, T-shirt", "id": 0.89},
            {"description": "Long-sleeved pajama top, long pajama trousers, short 3/4 sleeved robe, slippers (no socks)", "id": 0.96},
            {"description": "Same as above, plus suit jacket", "id": 0.96},
            {"description": "Same as above, plus vest and T-shirt", "id": 0.96},
            {"description": "Trousers, long-sleeved shirt, long-sleeved sweater, T-shirt", "id": 1.01},
            {"description": "Knee-length skirt, long-sleeved shirt, half slip, panty hose, suit jacket", "id": 1.04},
            {"description": "Ankle-length skirt, long-sleeved shirt, suit jacket, panty hose", "id": 1.10},
            {"description": "Knee-length skirt, long-sleeved shirt, half slip, panty hose, long-sleeved sweater", "id": 1.10},
            {"description": "Same as above, plus suit jacket and long underwear bottoms", "id": 1.30},
            {"description": "Insulated coveralls, long-sleeved thermal underwear, long underwear bottoms", "id": 1.37},
        ]},
      ],
      rules: {
        required: (value:[string, number]) => !!value || 'Required.',
      },
      headers: [
        { title: 'ID', value: 'id', align: 'end', sortable: true },
        { title: 'Participant', value: 'participant', align: 'end' },
        { title: 'Comfort Point', value: 'comfort_point', align: 'center', sortable: true },
        { title: 'Created Date', value: 'created_date', align: 'end', sortable: true },
        { title: 'Ger', value: 'ger', align: 'end' },
        { title: 'Timestamp', value: 'timestamp', align: 'end' },
        { title: 'Weather Condition', value: 'weather_condition', align: 'end' },
        { title: 'Inside Temperature (°C)', value: 'inside_temperature', align: 'end', sortable: true},
        { title: 'Inside Humidity (%)', value: 'inside_humidity', align: 'end', sortable: true},
        { title: 'Outside Temperature (°C)', value: 'outside_temperature', align: 'end', sortable: true },
        { title: 'Outside Humidity (%)', value: 'outside_humidity', align: 'end', sortable: true },
        { title: 'Heart Rate (bpm)', value: 'heart_rate', align: 'end', sortable: true },
        { title: 'Skin Temperature (°C)', value: 'skin_temperature', align: 'end', sortable: true},
        { title: 'Metabolic Rate (Cal)', value: 'metabolic_rate', align: 'end', sortable: true},
        // { title: 'Activity Level (METs)', value: 'activity_level', align: 'end' },
        { title: 'Clothing Level (clo)', value: 'clothing_level', align: 'end' },
        { title: 'Sleep Point', value: 'sleep_point', align: 'end' },
        { title: 'Is User Come In', value: 'is_user_come_in', align: 'end' },
        { title: 'Is Door Open', value: 'is_door_open', align: 'end' },
        { title: 'Is Window Open', value: 'is_window_open', align: 'end' },
        { title: 'Is Brim Open', value: 'is_brim_open', align: 'end' },
      ],
      serverItems: [],
      loading: true,
      totalItems: 0,
      itemsPerPage: 5,
      access_token: null,
      participants: 0,
      isLoading: false,
    }
  },
  computed: {
    download_url() {
      return process.env.NODE_ENV !== 'production' 
            ? 'http://localhost:8000/thermaldata/download_csv' 
            : 'https://thinkitsfree.azurewebsites.net/thermaldata/download_csv';
    }
  },
  methods: {
    loadItems() {
      this.loading = true;
      this.$axios.get('/thermaldata/')
        .then((response: any) => {
          console.log(response.data);
          this.serverItems = response.data.results;
          this.totalItems = response.count;
          this.loading = false;
        }).catch((error: any) => {
          this.loading = false;
          console.error('Failed to fetch thermal data: ' + error);
        });
    },
    submitForm() {
      this.isLoading = true;
      if (this.$refs.form.validate()) {
        console.log(this.form)
        const temp_form: any = {};

        for(const key in this.form) {
          if (typeof(this.form[key]) === 'object') {
            temp_form[key] = this.form[key].id;
          } else {
            temp_form[key] = this.form[key];
          }
        }

        // Add participant field
        temp_form['participant'] = this.participants.filter(item => item.user == this.access_token['user_id'])[0].id;

        this.$axios.post('/thermaldata/', temp_form)
          .then((response: any) => {
            console.log('Data added:', response.data);
            this.loadItems();  // Reload items to show the new data
            this.$refs.form.reset();
            this.isLoading = false;
          })
          .catch((error: any) => {
            console.error('Failed to add data: ' + error);
          });
      }
    },
    convertToReadableText(item: any) {
      return item.props.title.description;
    },
    generateTimeChoices() {
      const startTime = new Date();
      startTime.setHours(8, 10, 0, 0); // 8:10 AM
      const endTime = new Date();
      endTime.setHours(23, 0, 0, 0); // 11:00 PM
      const timeList = [];

      const options = { hour: '2-digit', minute: '2-digit', hour12: true };

      while (startTime <= endTime) {
        const timeStr = startTime.toLocaleTimeString('en-US', options);
        timeList.push({ id: timeStr, description: timeStr });
        startTime.setMinutes(startTime.getMinutes() + 10);
      }

      return timeList;
    },
    getAccessToken() {
      return decodeToken(localStorage.getItem('access_token'));
    },
    getParticipants() {
      this.$axios.get('/participants/')
        .then((response: any) => {
          this.participants = response.data.results;
        }).catch((error: any) => {
          console.error('Failed to fetch participants: ' + error);
        });
    },
    exportToCSV() {
      this.$axios.get('/thermaldata/download_csv');
    }
  },
  async mounted() {
    await this.getParticipants();
    await this.loadItems();
    this.access_token = this.getAccessToken();
  },
  created() {
    this.form_with_options[2].options = this.generateTimeChoices();
  }
}
</script>

<style scoped>
/* Add your custom styles here */
</style>
