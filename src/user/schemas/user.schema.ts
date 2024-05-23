import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { UserRole } from '../types/enums/role';

export type UserDocument = HydratedDocument<User>;

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
export class User {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  email: string;

  @Prop({ type: String, enum: UserRole })
  role: UserRole;

  @Prop()
  password: string;

  @Prop({ type: [String] })
  auditedCompanies?: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
