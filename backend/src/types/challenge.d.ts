export type TChallenge = {
	_id: string;
	name: string;
	description?: string;
	startDate: Date;
	endDate: Date;
	targetKm: number;
	maxRunPace: number;
	minWalkingDistance: number;
	minRunningDistance: number;
	__v: number;
	createdAt: Date;
	updatedAt: Date;
};
