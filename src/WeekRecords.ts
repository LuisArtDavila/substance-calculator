const DAY_IN_MILLISECONDS = 86400000;
const differenceInDays = (laterDate: Date, earlierDate: Date): number => {
    const differenceBetweenDates = laterDate.getTime() - earlierDate.getTime();
    return Math.floor(differenceBetweenDates / DAY_IN_MILLISECONDS);
};

export type WeekRecord = {
    readonly week: number;
    readonly startingDay: Date;
    readonly endingDay: Date;
    readonly desiredDose: number;

    // User provided dose information to help calculate the rest of the week
    readonly lastDose: number;
    readonly daysSinceLastDose: number;

    readonly doseFrequency: number;

    // ChartJS-specific properties
    readonly borderColor: string;
    readonly backgroundColor: string;

    finalDose: number;
    dosing: Array<number>;
}

export class WeekRecords {
    public currentWeekIndex: number = 0;
    earliestStartDate: Date | undefined;
    latestEndDate: Date | undefined;
    records: Array<WeekRecord> = [];

    public addWeek(partialWeek: Partial<WeekRecord>): WeekRecord {
        if (this.earliestStartDate == undefined) {
            this.earliestStartDate = partialWeek.startingDay;
            this.latestEndDate = partialWeek.endingDay;

            // TODO: Immedietely return week here
        }

        // Generate dosing first
        partialWeek.dosing = this.estimateDosing(partialWeek);

        if (this.earliestStartDate < partialWeek.startingDay) {
            // Calculate the difference
            const startDateDifference = differenceInDays(
                partialWeek.startingDay,
                this.earliestStartDate
            );
            console.log("startDateDifference: %d", startDateDifference);

            partialWeek.dosing = [
                ...Array(startDateDifference),
                ...partialWeek.dosing,
            ];
        } else {
            this.earliestStartDate = partialWeek.startingDay;
            console.log('Updating other weeks starting doses..');

            for (const week of this.records) {
                const startDateDifference = differenceInDays(
                    week.startingDay,
                    partialWeek.startingDay
                );
                console.log(`Calculated a ${startDateDifference} day difference..`);
                week.dosing = [
                    ...Array(startDateDifference),
                    ...week.dosing
                ]
                console.log(`New week's dosing (startingDay): ${week.dosing}`);
            }
        }

        if (this.latestEndDate > partialWeek.endingDay) {
            const endDateDifference = differenceInDays(
                this.latestEndDate,
                partialWeek.endingDay
            );
            console.log("endDateDifferenceDays: %d", endDateDifference);

            partialWeek.dosing = [
                ...partialWeek.dosing,
                ...Array(endDateDifference),
            ];
        } else {
            this.latestEndDate = partialWeek.endingDay;
            console.log("Updating other weeks end doses..");

            for (const week of this.records) {
                const endDateDifference = differenceInDays(
                    partialWeek.endingDay,
                    week.endingDay
                );
                console.log(`Calculcated a ${endDateDifference} day difference..`);
                week.dosing = [
                    ...week.dosing,
                    ...Array(endDateDifference)
                ]
            }
        }

        const week: WeekRecord = {
            week: partialWeek.week,
            startingDay: partialWeek.startingDay,
            endingDay: partialWeek.endingDay,
            desiredDose: partialWeek.desiredDose,
            lastDose: partialWeek.lastDose,
            daysSinceLastDose: partialWeek.daysSinceLastDose,
            doseFrequency: partialWeek.doseFrequency,
            finalDose: partialWeek.dosing[-1],
            dosing: partialWeek.dosing,
            borderColor: partialWeek.borderColor,
            backgroundColor: partialWeek.borderColor.replace("1)", "0.5)")
        };

        this.records.push(week);

        return week;
    }

    public generateChartLabels(): Array<string> {
        const toChartDateString = (date: Date) => {
            return date.toLocaleDateString("en-us", {
                weekday: "long",
                month: "short",
                day: "2-digit",
            });
        };

        let currentDay = new Date(this.earliestStartDate);
        const labels = [toChartDateString(this.earliestStartDate)];
        while (currentDay < this.latestEndDate) {
            let nextDay = currentDay.setDate(currentDay.getDate() + 1);
            currentDay = new Date(nextDay);

            let currentLabel = toChartDateString(currentDay);
            labels.push(currentLabel);
        }

        return labels;
    }

    private estimateDosing(week: WeekRecord | Partial<WeekRecord>) {
        const dateRange = differenceInDays(week.endingDay, week.startingDay);
        const doseData = [];

        console.dir(week);
        console.table(week);

        // After the initial loop, this should change to the dose frequency specified by the user
        let daysSinceLastDose = week.daysSinceLastDose || week.doseFrequency;
        let previousDoseEstimate = week.lastDose;
        let estimatedDose = 0;

        for (const currentDay of Array(dateRange).keys()) {
            if (currentDay % week.doseFrequency === 0) {
                estimatedDose =
                    (previousDoseEstimate / 100) *
                    280.059565 * Math.pow(daysSinceLastDose, -0.412565956) +
                    (week.desiredDose - previousDoseEstimate);
                
                previousDoseEstimate = estimatedDose;
                daysSinceLastDose = week.doseFrequency;
            } else {
                estimatedDose = 0;
            }

            estimatedDose = Math.round(estimatedDose);

            doseData.push(estimatedDose);
        }

        return doseData;
    }

    public getRecords(): Array<object> {
        const dosingRecords = this.records.map(record => ({
            label: `Week ${record.week}`,
            data: record.dosing,
            borderColor: record.borderColor,
            backgroundColor: record.backgroundColor
        }));

        console.log(dosingRecords);

        return dosingRecords;
    }
}