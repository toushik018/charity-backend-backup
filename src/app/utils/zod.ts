import { z } from 'zod';

export const MONGODB_OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export interface ZObjectIdOptions {
  requiredError?: string;
  invalidMessage?: string;
}

export const zObjectId = (options: ZObjectIdOptions = {}) => {
  const base = options.requiredError
    ? z.string({ required_error: options.requiredError })
    : z.string();

  return options.invalidMessage
    ? base.regex(MONGODB_OBJECT_ID_REGEX, options.invalidMessage)
    : base.regex(MONGODB_OBJECT_ID_REGEX);
};

export interface ZIntFromStringOptions {
  min: number;
  max?: number;
}

export const zIntFromString = ({ min, max }: ZIntFromStringOptions) => {
  const numberSchema =
    max === undefined
      ? z.number().int().min(min)
      : z.number().int().min(min).max(max);

  return z
    .string()
    .transform((v) => Number(v))
    .pipe(numberSchema);
};

export const zOptionalBooleanFromString = () => {
  return z
    .string()
    .transform((val) =>
      val === ''
        ? undefined
        : val === 'true'
          ? true
          : val === 'false'
            ? false
            : undefined
    )
    .optional() as unknown as z.ZodOptional<z.ZodBoolean>;
};
