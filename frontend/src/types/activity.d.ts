export type Activity = {
	_id: string
	name: string
	distance: number
	movingTime: number
	elapsedTime: number
	totalElevationGain: number
	movingPace: number
	type: string
	sportType: string
	workoutType: number
	activityDate: string
	isValid: boolean
	note: string
	__v: number
	createdAt: string
	updatedAt: string
}

export type User = {
	_id: string
	firstName: string
	lastName: string
	createdAt: string
	updatedAt: string
	__v: number
}

export type Stats = {
	totalDistance: number
	totalMovingTime: number
	averagePace: number
	totalActivities: number
	invalidActivities: number
	runningDistance: number
	walkingDistance: number
}

export type UserActivitiesWithStats = {
	user: User
	activities: Activity[]
	stats: Stats
}
