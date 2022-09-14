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
  import "./App.sass";

  let chart;

  // Generate the labels for the chart. Maybe could be rewritten to be cleaner.
  const toChartDateString = (date: Date) => {
    return date.toLocaleDateString("en-us", {
      weekday: "long",
      month: "short",
      day: "2-digit",
    });
  };

  const estimateDose = (
    previousDose: number,
    daysSinceLastDose: number,
    desiredDose: number
  ): number => {
    return (
      (previousDose / 100) *
        280.059565 *
        Math.pow(daysSinceLastDose, -0.412565956) +
      (desiredDose - previousDose)
    );
  };

  const DAY_IN_MILLISECONDS = 86400000;
  const startDay = new Date();
  const endDay = new Date(startDay.getTime() + DAY_IN_MILLISECONDS * 6);
  let currentDay = new Date(startDay);

  const labels = [toChartDateString(startDay)];

  while (currentDay < endDay) {
    let nextDay = currentDay.setDate(currentDay.getDate() + 1);
    currentDay = new Date(nextDay);

    let currentLabel = toChartDateString(currentDay);
    labels.push(currentLabel);
  }

  let consecutiveDays = 2;
  let desiredDose = 50;

  let data = {
    labels: labels,
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
    const randomlyGeneratedColor = generateRandomColor();

    const doseData = [];
    let previousDoseEstimate = 0;
    for (const _ of Array(consecutiveDays).keys()) {
      let estimatedDose = estimateDose(previousDoseEstimate, 1, desiredDose);
      doseData.push(estimatedDose);
      previousDoseEstimate = estimatedDose;
    }

    const weekIndex = data.datasets.length + 1;
    const weekData = {
      label: `Week ${weekIndex}`,
      data: doseData,
      borderColor: randomlyGeneratedColor,
      backgroundColor: randomlyGeneratedColor.replace("1)", "0.5)"),
      borderCapStyle: "butt",
    };

    data.datasets.push(weekData);
    chart.update();
  };

  const clearChart = (event) => {
    event.preventDefault();

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
