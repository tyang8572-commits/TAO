import { z } from "zod";

import { EVENT_STATUS } from "@/lib/constants";
import { combineDateAndTime } from "@/lib/dates";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "请输入姓名").max(20, "姓名不能超过 20 个字")
});

export const cancelSchema = signupSchema;

export const nameQuerySchema = z.object({
  name: z.string().trim().min(2, "请输入姓名").max(20, "姓名不能超过 20 个字")
});

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1, "请输入账号"),
  password: z.string().min(1, "请输入密码")
});

export const noticeSchema = z.object({
  content: z.string().trim().max(500, "通知不能超过 500 字")
});

export const eventSchema = z
  .object({
    title: z.string().trim().min(2, "请输入活动标题"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式不正确"),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "开始时间格式不正确"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "结束时间格式不正确"),
    venueName: z.string().trim().min(2, "请输入场馆名称"),
    venueAddress: z.string().trim().min(3, "请输入场馆地址"),
    capacity: z.coerce.number().int().positive("最大人数必须大于 0"),
    description: z.string().trim().optional().default(""),
    status: z.enum([EVENT_STATUS.OPEN, EVENT_STATUS.CANCELED, EVENT_STATUS.ENDED])
  })
  .superRefine((value, ctx) => {
    if (value.startTime >= value.endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "结束时间必须晚于开始时间"
      });
    }
  });

export function parseEventInput(input: z.infer<typeof eventSchema>) {
  const eventDate = new Date(`${input.date}T00:00:00`);

  return {
    title: input.title,
    eventDate,
    startTime: input.startTime,
    endTime: input.endTime,
    venueName: input.venueName,
    venueAddress: input.venueAddress,
    capacity: input.capacity,
    signupDeadline: combineDateAndTime(eventDate, input.startTime),
    description: input.description || "",
    status: input.status
  };
}
