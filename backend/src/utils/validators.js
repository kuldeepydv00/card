const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const signupSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  password: z.string().min(6)
});

const verifySignupSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  password: z.string().min(6),
  otp: z.string().length(6)
});

const placeBetSchema = z.object({
  cardCode: z.string().regex(/^([2-9]|10|[JQKA])([HDCS])$/),
  betAmount: z.number().min(Number(process.env.MIN_BET || 10)).max(Number(process.env.MAX_BET || 1000000))
});

const depositSchema = z.object({
  amount: z.number().min(100)
});

const manualDepositSchema = z.object({
  amount: z.number().min(100),
  utrNumber: z.string().min(5, "UTR/Transaction ID is required")
});

const withdrawalSchema = z.object({
  amount: z.number().min(100),
  account_details: z.object({
    upi_id: z.string().optional(),
    bank_account: z.object({
      account_number: z.string(),
      ifsc: z.string(),
      beneficiary_name: z.string()
    }).optional()
  }).refine(data => data.upi_id || data.bank_account, {
    message: "Either UPI ID or Bank Account details must be provided"
  })
});

module.exports = {
  loginSchema,
  signupSchema,
  verifySignupSchema,
  placeBetSchema,
  depositSchema,
  manualDepositSchema,
  withdrawalSchema
};
