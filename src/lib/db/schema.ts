import { pgTable, text, jsonb, timestamp, bigserial, index } from 'drizzle-orm/pg-core';

// SEED · 静态
export const activities = pgTable('activities', {
  id: text('id').primaryKey(),
  labelZh: text('label_zh').notNull(),
  iconPath: text('icon_path'),
  category: text('category'),
});

export const typeDefinitions = pgTable('type_definitions', {
  id: text('id').primaryKey(),
  labelZh: text('label_zh').notNull(),
  taglineZh: text('tagline_zh').notNull(),
  colorPri: text('color_pri').notNull(),
  colorSec: text('color_sec').notNull(),
  emoji: text('emoji'),
});

// CORE · 业务
export type Placement = {
  activity_id: string;
  passion: number;       // [-1, +1]
  confidence: number;    // [-1, +1]
  first_placed_at_ms: number;
  final_at_ms: number;
  move_count: number;
};

export type QuizMeta = {
  duration_ms: number;
  first_action_ms: number;
  viewport: { w: number; h: number };
};

export const quizSessions = pgTable('quiz_sessions', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  placements: jsonb('placements').$type<Placement[]>().notNull(),
  typeId: text('type_id').notNull().references(() => typeDefinitions.id),
  reportText: text('report_text'),
  reportStatus: text('report_status').notNull().default('pending'),  // 'pending' | 'streaming' | 'completed' | 'failed'
  ipHash: text('ip_hash').notNull(),
  userAgent: text('user_agent'),
  quizMeta: jsonb('quiz_meta').$type<QuizMeta>(),
}, (table) => [
  index('idx_sessions_created').on(table.createdAt),
  index('idx_sessions_type').on(table.typeId),
]);

// ANALYTICS · 埋点
export const shareEvents = pgTable('share_events', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  sessionId: text('session_id').notNull().references(() => quizSessions.id),
  eventType: text('event_type').notNull(),  // 'image_downloaded' | 'qr_scanned' | 'replay_clicked' | 'report_viewed'
  referrer: text('referrer'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_events_session').on(table.sessionId, table.createdAt),
  index('idx_events_type').on(table.eventType, table.createdAt),
]);

export type QuizSession = typeof quizSessions.$inferSelect;
export type NewQuizSession = typeof quizSessions.$inferInsert;
export type TypeDefinition = typeof typeDefinitions.$inferSelect;
export type Activity = typeof activities.$inferSelect;
