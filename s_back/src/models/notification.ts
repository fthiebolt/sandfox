import { INotification } from "../interfaces";
import { Document, Schema, model, Model } from "mongoose";
import { Alarm } from ".";


export interface INotificationModel extends INotification, Document {

}

export const notificationSchema: Schema<INotificationModel> = new Schema<INotificationModel>({
  last_date: Date,
  user_id: String,
  alarm: {
    _id: Schema.Types.ObjectId,
    buildings: {
      type: Array,
    },
    type: {
      type: String,
    },
    high_level: {
      seuil_min: Number,
      seuil_max: Number,
      required: false
    },
    avg_level: {
      seuil_min: Number,
      seuil_max: Number,
      required: false
    },
    low_level: {
      seuil_min: Number,
      seuil_max: Number,
      required: false
    },
    sms: Boolean,
    email: Boolean,
    notification: Boolean
  },
  seen: Boolean,
  seen_at:Date,
  value: Number,
  buildingName:String,
}, {
    timestamps: true
  });

export const Notification: Model<INotificationModel> = model<INotificationModel>('Notification', notificationSchema, 'notification');