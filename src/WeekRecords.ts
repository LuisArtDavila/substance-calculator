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
        }
        // Generate dosing first
        partialWeek.dosing = this.estimateDosing(partialWeek);

        // TODO: Fill for days that extend beyond the week's range.
        if (partialWeek.startingDay < this.earliestStartDate) {
            this.earliestStartDate = partialWeek.startingDay;
            // TODO: Update end of other weeks.
        }
        if (partialWeek.endingDay > this.latestEndDate) {
            this.latestEndDate = partialWeek.endingDay;
            // TODO: Update the beginning of other weeks.
        }

        if (this.earliestStartDate < partialWeek.startingDay) {
            // Calculate the difference
            const startDateDifference = differenceInDays(
                partialWeek.startingDay,
                this.earliestStartDate
            );
            console.log("startDateDifference: %d", startDateDifference);

            partialWeek.dosing = [
                ...Array(startDateDifference).fill(0),
                ...partialWeek.dosing,
            ];
        }

        if (this.latestEndDate > partialWeek.endingDay) {
            const endDateDifference = differenceInDays(
                this.latestEndDate,
                partialWeek.endingDay
            );
            console.log("endDateDifferenceDays: %d", endDateDifference);

            partialWeek.dosing = [
                ...partialWeek.dosing,
                ...Array(endDateDifference).fill(0),
            ];
        }

        const week: WeekRecord = {
            week: partialWeek.week,
            startingDay: partialWeek.startingDay,
            endingDay: partialWeek.endingDay,
            desiredDose: partialWeek.desiredDose,
            finalDose: partialWeek.dosing[-1],
            dosing: partialWeek.dosing,
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
        let previousDoseEstimate = 0;
        for (const _ of Array(dateRange).keys()) {
            let estimatedDose = (
                (previousDoseEstimate / 100) *
                280.059565 *
                Math.pow(1, -0.412565956) +
                (week.desiredDose - previousDoseEstimate)
            );
            doseData.push(estimatedDose);
            previousDoseEstimate = estimatedDose;
        }

        return doseData;
    }
}