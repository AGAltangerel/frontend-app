<template>
  <v-container class="h-100">
    <v-form v-model="valid" ref="form">
      <v-row>
        <!-- Loop through formFields for text fields -->
        <v-col cols="12" md="6" v-for="field in formFields" :key="field.key">
          <v-text-field
            v-model="form[field.key]"
            :label="field.label"
            :rules="[rules.required]"
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
          <v-btn @click="submitForm">Submit</v-btn>
        </v-col>
      </v-row>
    </v-form>

    <v-data-table
      :headers="headers"
      :items="serverItems"
      :items-per-page="itemsPerPage"
      :loading="loading"
    ></v-data-table>
  </v-container>
</template>

<script lang="ts">
export default {
  middleware: 'auth',
  data() {
    return {
      valid: false,
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
        activity_level: '',
        clothing_level: '',
        sleep_point: '',
        is_user_come_in: '',
        is_door_open: '',
        is_brim_open: '',
      },
      formFields: [
        { key: 'inside_temperature', label: 'Inside Temperature' },
        { key: 'inside_humidity', label: 'Inside Humidity' },
        { key: 'outside_temperature', label: 'Outside Temperature' },
        { key: 'outside_humidity', label: 'Outside Humidity' },
        { key: 'heart_rate', label: 'Heart Rate' },
        { key: 'skin_temperature', label: 'Skin Temperature' },
        { key: 'metabolic_rate', label: 'Metabolic Rate' },
        { key: 'activity_level', label: 'Activity Level' },
        { key: 'clothing_level', label: 'Clothing Level' },
        { key: 'sleep_point', label: 'Sleep Point' },
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
        // { key: 'weather_condition', label: 'Weather Condition' options: [{"id"}]},
      ],
      rules: {
        required: value => !!value || 'Required.',
      },
      headers: [
        { text: 'ID', value: 'id', align: 'end' },
        { text: 'Comfort Point', value: 'comfort_point.description', align: 'center', sortable: true },
        { text: 'Created Date', value: 'created_date', align: 'end' },
        { text: 'Modified Date', value: 'modified_date', align: 'end' },
        { text: 'Timestamp', value: 'timestamp', align: 'end' },
        { text: 'Weather Condition', value: 'weather_condition', align: 'end' },
        { text: 'Inside Temperature', value: 'inside_temperature', align: 'end' },
        { text: 'Inside Humidity', value: 'inside_humidity', align: 'end' },
        { text: 'Outside Temperature', value: 'outside_temperature', align: 'end' },
        { text: 'Outside Humidity', value: 'outside_humidity', align: 'end' },
        { text: 'Heart Rate', value: 'heart_rate', align: 'end' },
        { text: 'Skin Temperature', value: 'skin_temperature', align: 'end' },
        { text: 'Metabolic Rate', value: 'metabolic_rate', align: 'end' },
        { text: 'Activity Level', value: 'activity_level', align: 'end' },
        { text: 'Clothing Level', value: 'clothing_level', align: 'end' },
        { text: 'Sleep Point', value: 'sleep_point', align: 'end' },
        { text: 'Is User Come In', value: 'is_user_come_in', align: 'end' },
        { text: 'Is Door Open', value: 'is_door_open', align: 'end' },
        { text: 'Is Window Open', value: 'is_window_open', align: 'end' },
        { text: 'Is Brim Open', value: 'is_brim_open', align: 'end' },
        { text: 'Participant', value: 'participant', align: 'end' },
      ],
      serverItems: [],
      loading: true,
      totalItems: 0,
      itemsPerPage: 5,
    }
  },
  methods: {
    loadItems() {
      this.loading = true;
      this.$axios.get('/thermaldata/')
        .then((response) => {
          console.log(response.data);
          this.serverItems = response.data.results;
          this.totalItems = response.count;
          this.loading = false;
        }).catch((error) => {
          this.loading = false;
          console.error('Failed to fetch thermal data: ' + error);
        });
    },
    submitForm() {
      if (this.$refs.form.validate()) {
        this.$axios.post('/thermaldata/', this.form)
          .then(response => {
            console.log('Data added:', response.data);
            this.loadItems();  // Reload items to show the new data
            this.$refs.form.reset();
          })
          .catch(error => {
            console.error('Failed to add data: ' + error);
          });
      }
    },
    convertToReadableText(item) {
      return item.props.title.description;
    },
    generateTimeChoices() {
      const startTime = new Date();
      startTime.setHours(8, 10, 0, 0); // 8:10 AM
      const endTime = new Date();
      endTime.setHours(23, 0, 0, 0); // 11:00 PM
      const timeList = [];

      const options = { hour: 'numeric', minute: 'numeric', hour12: true };

      while (startTime <= endTime) {
        const timeStr = startTime.toLocaleTimeString('en-US', options);
        timeList.push({ id: timeStr, description: timeStr });
        startTime.setMinutes(startTime.getMinutes() + 10);
      }

      return timeList;
    },
  },
  mounted() {
    this.loadItems();
  },
  created() {
    this.form_with_options[2].options = this.generateTimeChoices();
  }
}
</script>

<style scoped>
/* Add your custom styles here */
</style>
