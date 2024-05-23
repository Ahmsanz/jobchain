import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ResourceDocument = HydratedDocument<Resource>;

@Schema({
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
  virtuals: {
    id: {
      get() {
        return this._id.toString();
      },
    },
  },
  id: false,
})
export class Resource {
  @Prop()
  company: string;

  @Prop({ type: {} })
  info: object;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);
