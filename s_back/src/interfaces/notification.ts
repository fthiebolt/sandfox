export interface INotification {
  user_id: string,
  alarm: {
    _id: string,
    buildings: {
      type: string[],
    },
    type: {
      type: string,
    },
    high_level: {
      seuil_min: number,
      seuil_max: number,
    },
    avg_level: {
      seuil_min: number,
      seuil_max: number,
    },
    low_level: {
      seuil_min: number,
      seuil_max: number,
    },
    sms: Boolean,
    email: Boolean,
    notification: Boolean
  },
  seen: boolean,
  seen_at:Date,
  value: number,
  buildingName:string,
  createdAt: Date,
  updatedAt: Date,
}