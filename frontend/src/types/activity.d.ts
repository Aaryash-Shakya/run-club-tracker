export type TActivity = {
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

export type TUser = {
	_id: string
	firstName: string
	lastName: string
	bio: string | null
	createdAt: string
	updatedAt: string
	__v: number
}

export type TStats = {
	totalDistance: number
	totalMovingTime: number
	averagePace: number
	totalActivities: number
	invalidActivities: number
	runningDistance: number
	walkingDistance: number
}

export type TUserWithStats = {
	user: TUser
	stats: TStats
}

export type TUserActivitiesWithStats = TUserWithStats & {
	activities: TActivity[]
}

export type TActivityWithUser = {
	_id: Types.ObjectId | string
	name: string
	distance: number
	movingTime: number
	elapsedTime: number
	totalElevationGain: number
	movingPace: number
	type: string
	sportType: string
	workoutType: number
	activityDate: Date
	isValid: boolean
	note: string | null
	user: {
		_id: Types.ObjectId | string
		firstName: string
		lastName: string
		bio: string | null
		createdAt: Date
		updatedAt: Date
		__v: number
	}
	__v: number
	createdAt: Date
	updatedAt: Date
}
