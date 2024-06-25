<template>
  <v-container class="rounded-md shadow-sm h-100 bg-black">
    <v-row>
      <v-col>
        <v-form v-model="valid" ref="form">
          <v-row>
            <v-col cols="12" md="6" sm="4" v-for="field in formFields" :key="field.key">
              <v-text-field
                v-model="form[field.key]"
                :label="field.label"
                :rules="[rules.required]"
                :type="field.type"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6" sm="4" v-for="selection in form_with_options" :key="selection.key">
              <v-select
                :label="selection.label"
                no-data-text="Empty"
                :items="selection.options"
                v-model="form[selection.key]"
                :rules="[rules.required]"
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
              <v-btn block elevation="2" color="secondary" :loading="isFormLoading" :disabled="isFormLoading" @click.prevent="submitForm">Submit</v-btn>
            </v-col>
          </v-row>
        </v-form>
        <br/>
        <v-card flat variant="outlined">
          <v-card-actions>
            <v-btn elevation="2" color="secondary">
              <a class="btn btn-blue" :href="download_url" download="thermal_data.csv"> Export to CSV</a>
            </v-btn>
          </v-card-actions>
          <template v-slot:text>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
          </template>
          <v-data-table
            :headers="headers"
            :items="serverItems"
            :items-per-page="itemsPerPage"
            :loading="loading"
            :sortable="true"
            :search="search"
            theme="dark"
          >
            <template v-slot:item.participant="{ item }" v-if="participants">
              <div class="text-end">({{ item?.participant }}). {{ participants?.find(participant => participant.id == item.participant)?.gender }}</div>
            </template>
            <template v-slot:item.comfort_point="{ item }">
              <v-chip class="text-center" :color="getColor(item.comfort_point)"> {{ getDescription('comfort_point', item.comfort_point) }} </v-chip>
            </template>
            <template v-slot:item.created_date="{ item }">
              <div class="text-center">{{ formatDate(item.created_date) }}</div>
            </template>
            <template v-slot:item.ger="{ item }">
              <div class="text-center"> {{ getDescription('ger', item.ger, 'name') }} </div>
            </template>
            <template v-slot:item.weather_condition="{ item }">
              <div class="text-center">
                {{ getDescription('weather_condition', item.weather_condition) }}
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
      <v-col>
        <v-card>
          <v-layout>
            <v-navigation-drawer expand-on-hover location="right" rail theme="dark">
              <template v-slot:prepend>
                <v-list-item lines="two" href="https://thinkitsfree.azurewebsites.net/admin" :prepend-avatar="profile_img_url" subtitle="Profile"></v-list-item>
              </template>
              <v-divider></v-divider>
              <v-list density="compact" mode="out-in" nav>
                <v-list-item prepend-icon="mdi-logout" title="Logout" value="Logout" @click="navigateTo('/logout')"></v-list-item>
              </v-list>
            </v-navigation-drawer>
          </v-layout>
        </v-card>

        <v-snackbar
          :timeout="timeout"
          :color="color"
          elevation="24"
          v-model="isToast"
          top="true"
        >
          {{ alertMsg}}
        </v-snackbar>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">

import { decodeToken } from "~/utils/jwt.js";

export default {
  middleware: 'auth',
  data() {
    return {
      isToast: false,
      alertMsg: "",
      timeout: 6000,
      color: '',

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
            { id: -3, description: "Cold", color: "#1133cf" },
            { id: -2, description: "Cool", color: "#0460d9" },
            { id: -1, description: "Slightly Cool", color: "#0d77bd" },
            { id: 0, description: "Neutral", color: "green" },
            { id: 1, description: "Slightly Warm", color: "#b6d904" },
            { id: 2, description: "Warm", color: "#d9c404" },
            { id: 3, description: "Hot", color: "#d92f04" }
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
            {"id": "0", "description": "Clear"}, 
            {"id": "1", "description": "Cloudy"}, 
            {"id": "2", "description": "Sunny"}, 
            {"id": "3", "description": "Foggy"}, 
            {"id": "4", "description": "Rainy"}, 
            {"id": "5", "description": "Windy"}
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
        { title: 'Timestamp', value: 'timestamp', align: 'end' },
        { title: 'Ger', value: 'ger', align: 'end' },
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
      isFormLoading: false,
      profile_img_url: "",
    }
  },
  computed: {
    download_url() {
      return process.env.NODE_ENV !== 'production' 
            ? 'http://localhost:8000/thermaldata/download_csv' 
            : 'https://thinkitsfree.azurewebsites.net/thermaldata/download_csv';
    },
  },
  methods: {
    async loadItems() {
      this.loading = true;
      try {
        const response = await this.$axios.get('/thermaldata/');
        this.serverItems = response.data.results;
        this.totalItems = response.data.count;
      } catch (error) {
        console.error('Error loading items:', error);
      } finally {
        this.loading = false;
      }
    },
    async submitForm() {
      this.isFormLoading = true;
      this.$refs.form.validate();
      if (this.$refs.form.isValid) {
        const temp_form = {};
        for (const key in this.form) {
          temp_form[key] = typeof this.form[key] === 'object' ? this.form[key].id : this.form[key];
        }
        temp_form['participant'] = this.participants.find(item => item.user == this.access_token.user_id).id;
        try {
          await this.$axios.post('/thermaldata/', temp_form);
          await this.storeCurrentFormNext();
          await this.showToast('Data added successfully', 'success');
          this.loadItems();
          this.$refs.form.reset();
        } catch (error) {
          console.error('Failed to add data:', error);
        } finally {
          this.isFormLoading = false;
        }
      } else {
        this.isFormLoading = false;
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
    async getParticipants() {
      try {
        const response = await this.$axios.get('/participants/');
        this.participants = response.data.results;
        this.access_token = this.getAccessToken();
        this.getProfileImage();
      } catch (error) {
        console.error('Failed to fetch participants:', error);
      }
    },
    getProfileImage() {
      const participant = this.participants.find(item => item.user == this.access_token.user_id);
      this.profile_img_url = participant ? participant.profile_img_url : '';
    },
    exportToCSV() {
      this.$axios.get('/thermaldata/download_csv');
    },
    getColor(value) {
      const option = this.form_with_options.find(i => i.key === 'comfort_point')?.options.find(j => j.id == value);
      return option ? option.color : '';
    },
    getDescription(key, value, subkey = 'description') {
      const option = this.form_with_options.find(i => i.key === key)?.options.find(j => j.id == value);
      return option ? option[subkey] : '';
    },
    formatDate(dateString: string) {
      return new Date(dateString).toLocaleDateString();
    },
    async storeCurrentFormNext() {
      console.log(this.form);
      this.form.inside_humidity = '';
      this.form.inside_temperature = '';
      this.form.outside_humidity = '';
      this.form.outside_temperature = '';
      this.form.heart_rate = '';
      this.form.skin_temperature = '';
      this.form.metabolic_rate = '';
      this.form.comfort_point = null;

      localStorage.setItem('latest_thermal_data', JSON.stringify(this.form));
    },
    async loadLatestStoredForm() {
      const latest_form = localStorage.getItem('latest_thermal_data');
      if (latest_form) {
        this.form = JSON.parse(latest_form);
      }
    },
    async serializeTimeStamps() {
      const timeList = this.generateTimeChoices();
      this.form_with_options.find(opt => opt.key === 'timestamp').options = timeList;
    },
    async showToast(msg: string, type: string, duration: number=6000) {
      this.alertMsg = msg;
      this.timeout = duration;
      this.color = type;
      this.isToast = true;
    }
  },
  async mounted() {
    await this.serializeTimeStamps();
    await this.loadLatestStoredForm();
    await this.getParticipants();
    await this.loadItems();

  },
  created() {
  }
}
</script>

<style scoped>
/* Add your custom styles here */
</style>
