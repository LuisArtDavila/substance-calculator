<script lang="ts">
  import {
    Col,
    Container,
    Button,
    Form,
    FormGroup,
    Input,
    InputGroup,
    InputGroupText,
    Label,
    Row,
  } from "sveltestrap";
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  } from "chart.js";

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );
  import { Line } from "svelte-chartjs";
  import { DateInput } from "date-picker-svelte";

  import "./App.sass";
  import { WeekRecords, type WeekRecord } from "./WeekRecords";

  let chart;

  const weekRecords = new WeekRecords();

  let consecutiveDays = 6;
  let desiredDose = 50;

  let startDay = new Date();

  let data = {
    labels: [],
    datasets: [],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Substance Dosing Chart",
      },
    },
  };

  const insertWeek = (event) => {
    event.preventDefault();

    const generateRandomColor = () =>
      `hsla(${Math.random() * 360}, 70%, 80%, 1)`;
    const randomChartLabelColor = generateRandomColor();

    const endDay = new Date(startDay);
    endDay.setDate(startDay.getDate() + consecutiveDays);

    const weekRecord: WeekRecord = weekRecords.addWeek({
      week: ++weekRecords.currentWeekIndex,
      startingDay: startDay,
      endingDay: endDay,
      desiredDose: desiredDose,
    });

    console.log(`Week dosing: ${weekRecord.dosing}`);

    const weekData = {
      label: `Week ${weekRecord.week}`,
      data: weekRecord.dosing,
      borderColor: randomChartLabelColor,
      backgroundColor: randomChartLabelColor.replace("1)", "0.5)"),
    };

    data.datasets.push(weekData);
    data.labels = weekRecords.generateChartLabels();
    chart.update();
  };

  const clearChart = (event) => {
    event.preventDefault();

    weekRecords.currentWeekIndex = 0;
    weekRecords.records = [];

    chart.data.labels = [];
    chart.data.datasets = [];
    chart.update();
  };
</script>

<main>
  <Container class="p-3">
    <h1 class="mb-3">Substance Calculator</h1>
    <Form>
      <Row>
        <Col xs="3">
          <InputGroup class="mb-3">
            <FormGroup floating label="Desired dose" class="no-margin">
              <Input bind:value={desiredDose} placeholder="Desired dose" />
            </FormGroup>
            <InputGroupText>μg</InputGroupText>
          </InputGroup>
        </Col>
      </Row>
      <Label>Starting date</Label>
      <Row class="mb-3">
        <Col xs="3">
          <DateInput bind:value={startDay} format="yyyy-MM-dd" />
        </Col>
      </Row>
      <Row>
        <Col xs="3">
          <FormGroup>
            <Label for="consecutiveDays">
              For how many consecutive days? {consecutiveDays}
            </Label>
            <Input
              type="range"
              name="range"
              id="consecutiveDays"
              bind:value={consecutiveDays}
              min="2"
              max="14"
              step="1"
              placeholder="Range placeholder"
            />
          </FormGroup>
        </Col>
      </Row>
      <Button color="primary" on:click={insertWeek}>Add week</Button>
      <Button color="danger" on:click={clearChart}>Reset chart</Button>
    </Form>
    <Row>
      <Line bind:chart {data} {options} />
    </Row>
  </Container>
</main>
