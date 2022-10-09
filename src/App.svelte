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
    ListGroup,
    ListGroupItem,
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
  import { WeekRecords } from "./WeekRecords";

  const microgramsUnit = "μg";

  let chart;

  let weekRecords = new WeekRecords();

  // Bound variables
  let consecutiveDays = 6;
  let desiredDose = 50;

  let lastDose = 0;
  let daysSinceLastDose = 0;

  let chartRowVisibility = "hidden";

  // Partially a workaround for "selected" not working.
  // See: https://github.com/bestguy/sveltestrap/issues/391
  let doseFrequency = "1";

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

    const endDay = new Date(startDay);
    endDay.setDate(startDay.getDate() + consecutiveDays);

    const randomChartLabelColor = `hsla(${Math.random() * 360}, 70%, 80%, 1)`;

    weekRecords.addWeek({
      week: ++weekRecords.currentWeekIndex,
      startingDay: startDay,
      endingDay: endDay,
      desiredDose: desiredDose,
      lastDose: lastDose,
      daysSinceLastDose: daysSinceLastDose,
      doseFrequency: parseInt(doseFrequency),
      borderColor: randomChartLabelColor,
    });

    data.datasets = weekRecords.getRecords();
    data.labels = weekRecords.generateChartLabels();
    chart.update();

    chartRowVisibility = "visible";
  };

  const clearChart = (event) => {
    event.preventDefault();

    weekRecords = new WeekRecords();

    data.datasets = [];
    chart.data.labels = [];
    chart.data.datasets = [];
    chart.update();
  };
</script>

<main>
  <Container class="p-3">
    <h1 class="mb-3">Substance Calculator</h1>
    <Form class="mb-3">
      <Row class="gx-5">
        <Col xs="3">
          <InputGroup class="mb-3">
            <FormGroup floating label="Desired dose" class="no-margin">
              <Input bind:value={desiredDose} placeholder="Desired dose" />
            </FormGroup>
            <InputGroupText>{microgramsUnit}</InputGroupText>
          </InputGroup>
        </Col>
        <Col xs="3">
          <InputGroup>
            <FormGroup floating label="Last dose (optional)" class="no-margin">
              <Input bind:value={lastDose} placeholder="Last dose" />
            </FormGroup>
            <InputGroupText>{microgramsUnit}</InputGroupText>
          </InputGroup>
        </Col>
      </Row>
      <Row class="gx-5">
        <Col xs="3">
          <Label>Starting date</Label>
          <DateInput bind:value={startDay} format="yyyy-MM-dd" />
        </Col>
        <Col xs="3">
          <FormGroup>
            <Label for="daysSinceLastDose">
              Days since last dose: {daysSinceLastDose}
            </Label>
            <Input
              type="range"
              name="range"
              id="daysSinceLastDose"
              bind:value={daysSinceLastDose}
              min="0"
              max="14"
              step="1"
              placeholder="Range placeholder"
              disabled={lastDose < 1}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col xs="3">
          <FormGroup class="no-margin">
            <Label for="consecutiveDays">
              For how long will you be dosing? {consecutiveDays} days
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
      <Row>
        <Col xs="3">
          <FormGroup>
            <Label for="doseFrequency">Dose frequency</Label>
            <Input
              type="select"
              name="select"
              id="doseFrequency"
              bind:value={doseFrequency}
            >
              <option value="1">Every day</option>
              <option value="2">Every other day</option>
              <option value="3">Every three days</option>
            </Input>
          </FormGroup>
        </Col>
      </Row>
      <Button color="primary" on:click={insertWeek}>Add week</Button>
      <Button color="danger" on:click={clearChart}>Reset chart</Button>
    </Form>
    <Row style="visibility: {chartRowVisibility}">
      <Col xs="3">
        <h3>Total Dosages</h3>
        <ListGroup flush>
          {#each data.datasets as week, weekIndex}
            <ListGroupItem>
              <strong>Week {weekIndex + 1}:</strong>
              {week.data.reduce(
                (previousValue, currentValue) => previousValue + currentValue
              )} {microgramsUnit}
            </ListGroupItem>
          {/each}
        </ListGroup>
      </Col>
      <Col>
        <Line bind:chart {data} {options} />
      </Col>
    </Row>
  </Container>
</main>
