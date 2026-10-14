
const bcrypt = require("bcryptjs");

async function main() {
  const password = process.env.NEW_ADMIN_PASSWORD;

  if (!password || password.length < 16) {
    throw new Error(
      "Set NEW_ADMIN_PASSWORD to a strong password " +
      "of at least 16 characters."
    );
  }

  const hash = await bcrypt.hash(password, 12);

  console.log("ADMIN_PASSWORD_HASH=");
  console.log(hash);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
