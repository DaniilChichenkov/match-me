import { serve, upgradeWebSocket } from "@hono/node-server";
import { WebSocketServer } from "ws";
import { Hono } from "hono";
import type { WSContext } from "hono/ws";
import { cors } from "hono/cors";
import { sign, jwt, type JwtVariables } from "hono/jwt";
import { setCookie, deleteCookie } from "hono/cookie";

import argon2 from "argon2";

// Connected users
const connectedUsers = new Map<string, Set<WSContext>>();

type JwtPayload = {
  sub: string;
};

type Variables = JwtVariables<JwtPayload>;

// DB
import {
  eq,
  ne,
  and,
  or,
  arrayOverlaps,
  type SQL,
  notInArray,
  notExists,
  desc,
  count,
  inArray,
  sql,
} from "drizzle-orm";
import { db } from "./db/index.js";
import {
  users,
  userBio,
  userProfile,
  connections,
  messages,
  messagesNotifications,
} from "./db/schema.js";
import path, { basename, extname, join } from "node:path";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono<{ Variables: Variables }>();
app.use("/api/*", cors({ origin: "http://localhost:5173", credentials: true }));

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// Use auth middleware for protected routes
app.use(
  "/api/me",
  jwt({
    secret: process.env.JWT_SECRET!,
    alg: "HS256",
    cookie: "access_token",
  }),
);
app.use(
  "/api/me/*",
  jwt({
    secret: process.env.JWT_SECRET!,
    alg: "HS256",
    cookie: "access_token",
  }),
);
app.use(
  "/api/recommendations",
  jwt({
    secret: process.env.JWT_SECRET!,
    alg: "HS256",
    cookie: "access_token",
  }),
);
app.use(
  "/api/connections",
  jwt({
    secret: process.env.JWT_SECRET!,
    alg: "HS256",
    cookie: "access_token",
  }),
);
app.use(
  "/api/connections/*",
  jwt({
    secret: process.env.JWT_SECRET!,
    alg: "HS256",
    cookie: "access_token",
  }),
);
app.use(
  "/api/users/*",
  jwt({
    secret: process.env.JWT_SECRET!,
    alg: "HS256",
    cookie: "access_token",
  }),
);
app.use(
  "/uploads/avatars/*",
  jwt({
    secret: process.env.JWT_SECRET!,
    alg: "HS256",
    cookie: "access_token",
  }),
);
app.use(
  "/ws",
  jwt({
    secret: process.env.JWT_SECRET!,
    alg: "HS256",
    cookie: "access_token",
  }),
);
app.use(
  "/api/notifications",
  jwt({
    secret: process.env.JWT_SECRET!,
    alg: "HS256",
    cookie: "access_token",
  }),
);
app.use(
  "/api/notifications/*",
  jwt({
    secret: process.env.JWT_SECRET!,
    alg: "HS256",
    cookie: "access_token",
  }),
);

app.get(
  "/uploads/avatars/:filename",
  serveStatic({
    root: "./",
  }),
);

// Register route
app.post("/api/register", async (c) => {
  try {
    // Get json body
    const body: {
      email: string;
      password: string;
      passwordConfirmation: string;
    } = await c.req.json();

    // Validate body
    const { email, password, passwordConfirmation } = body;

    // Check for missing body
    if (
      !email ||
      typeof email !== "string" ||
      !password ||
      typeof password !== "string" ||
      !passwordConfirmation ||
      typeof passwordConfirmation !== "string"
    ) {
      return c.json(
        {
          error: "notAllFieldsProvided",
          success: false,
        },
        400,
      );
    }

    // Check if password / password confirmation are indentical
    if (password !== passwordConfirmation) {
      return c.json(
        {
          error: "passwordsNotSame",
        },
        400,
      );
    }

    // Check if user with such email is not already created
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (user) {
      return c.json({ error: "emailAlreadyInUse", success: false }, 400);
    }

    // Hash password before storing it in DB
    const hashedPassword = await argon2.hash(password);

    // Store user in DB
    await db.insert(users).values({ email, password: hashedPassword });

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "serverSideError", success: false }, 500);
  }
});

// Login route
app.post("/api/login", async (c) => {
  try {
    const body: { email: string; password: string } = await c.req.json();
    const { email, password } = body;

    if (
      !email ||
      typeof email !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      return c.json({ error: "notAllFieldsProvided" }, 400);
    }

    // Fetch user from database by email
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return c.json({ error: "wrongCredentials" }, 400);
    }

    // Compare passwords
    const isPassValid = await argon2.verify(user.password, password);

    if (!isPassValid) {
      return c.json({ error: "wrongCredentials" }, 400);
    }

    // Sign JWT token
    const token = await sign(
      {
        sub: String(user.id),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      },
      process.env.JWT_SECRET!,
    );

    // Store token in HTTP-only cookies
    setCookie(c, "access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return c.json({ success: true });
  } catch (error) {
    console.log(error);
    return c.json({ error: "serverSideError", success: false }, 500);
  }
});

// Log out route
app.post("/api/logout", async (c) => {
  deleteCookie(c, "access_token", {
    path: "/",
  });

  return c.json({ success: true });
});

// Get user data
app.get("/api/me", async (c) => {
  try {
    // Get JWT token from cookie
    const payload = c.get("jwtPayload");

    // Access user by token from DB
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.sub));

    // If user was not found
    if (!user) {
      return c.json({ success: false, error: "userNotFound" }, 404);
    }

    // return c.json({ user: user });
  } catch (error) {
    console.log(error);
    return c.json({ error: "serverSideError" }, 500);
  }
});

//

// Get profile data of authenticated user
app.get("/api/me/profile", async (c) => {
  try {
    // Get JWT token from cookie
    const payload = c.get("jwtPayload");

    // Access user by token from DB
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.sub));

    // If user was not found
    if (!user) {
      return c.json({ success: false, error: "userNotFound" }, 404);
    }

    // Get profile of user by id
    const [userProfileData] = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, user.id));

    // If user profile was not found -> User didnt set it up -> Redirect to setup page
    if (!userProfileData) {
      return c.json({ success: false, error: "profileNotFound" }, 404);
    }

    return c.json({ success: true, profile: userProfileData });
  } catch (error) {
    return c.json({ success: false, error: "serverSideError" }, 500);
  }
});

// Create profile (Personal info)
app.post("/api/me/profile", async (c) => {
  try {
    // Get JWT payload
    const payload = c.get("jwtPayload");

    if (typeof payload?.sub !== "string") {
      return c.json({ success: false, error: "unauthorized" }, 401);
    }

    // Find authenticated user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.sub));

    if (!user) {
      return c.json({ success: false, error: "userNotFound" }, 404);
    }

    // Parse FormData
    const formData = await c.req.parseBody();

    const firstname = formData.firstname;
    const lastname = formData.lastname;
    const profilePic = formData.profilePic;

    // Validate text fields
    if (
      typeof firstname !== "string" ||
      !firstname.trim() ||
      firstname.length > 255 ||
      typeof lastname !== "string" ||
      !lastname.trim() ||
      lastname.length > 255
    ) {
      return c.json({ success: false, error: "badDataProvided" }, 400);
    }

    // Validate optional image
    const allowedTypes: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    };

    let uploadedFileName: string | undefined;
    let uploadedFilePath: string | undefined;

    if (profilePic !== undefined) {
      if (!(profilePic instanceof File)) {
        console.log("HERE");
        return c.json({ success: false, error: "invalidImage" }, 400);
      }

      if (profilePic.size > 0) {
        const extension = allowedTypes[profilePic.type];

        if (!extension || profilePic.size > 5 * 1024 * 1024) {
          return c.json({ success: false, error: "invalidImage" }, 400);
        }

        const buffer = Buffer.from(await profilePic.arrayBuffer());

        // Generate unique filename
        uploadedFileName = `${randomUUID()}${extension}`;

        // Directory for uploaded images
        const uploadDir = path.join(process.cwd(), "uploads", "avatars");

        await mkdir(uploadDir, { recursive: true });

        uploadedFilePath = path.join(uploadDir, uploadedFileName);

        // Save image
        await writeFile(uploadedFilePath, buffer);
      }
    }

    // Create or update user profile
    try {
      await db
        .insert(userProfile)
        .values({
          userId: user.id,
          firstname: firstname.trim(),
          lastname: lastname.trim(),
          profilePic: uploadedFileName ?? null,
        })
        .onConflictDoUpdate({
          target: userProfile.userId,
          set: {
            firstname: firstname.trim(),
            lastname: lastname.trim(),

            // Only update picture if a new one was uploaded
            ...(uploadedFileName ? { profilePic: uploadedFileName } : {}),
          },
        });

      return c.json({ success: true });
    } catch (error) {
      // Remove newly uploaded file if database operation fails
      if (uploadedFilePath) {
        await unlink(uploadedFilePath).catch(() => {});
      }

      console.error("Failed to update profile:", error);

      return c.json({ success: false, error: "internalServerError" }, 500);
    }
  } catch (error) {
    return c.json({ success: false, error: "serverSideError" }, 500);
  }
});

// Change profile (Personal info)
app.patch("/api/me/profile", async (c) => {
  let uploadedFilePath: string | undefined;

  try {
    // Get JWT token from cookie
    const payload = c.get("jwtPayload");

    if (typeof payload?.sub !== "string") {
      return c.json({ success: false, error: "unauthorized" }, 401);
    }

    // Get user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.sub));

    if (!user) {
      return c.json({ success: false, error: "userNotFound" }, 404);
    }

    // Parse FormData
    const formData = await c.req.parseBody();

    const firstname = formData.firstname;
    const lastname = formData.lastname;
    const profilePic = formData.profilePic;

    // Validate text fields
    if (
      typeof firstname !== "string" ||
      !firstname.trim() ||
      firstname.length > 255 ||
      typeof lastname !== "string" ||
      !lastname.trim() ||
      lastname.length > 255
    ) {
      return c.json({ success: false, error: "badDataProvided" }, 400);
    }

    // Object containing fields to update
    const updateData: {
      firstname: string;
      lastname: string;
      profilePic?: string;
    } = {
      firstname: firstname.trim(),
      lastname: lastname.trim(),
    };

    // Process image only if provided
    if (profilePic !== undefined && profilePic !== "") {
      if (!(profilePic instanceof File)) {
        return c.json({ success: false, error: "invalidImage" }, 400);
      }

      if (profilePic.size > 0) {
        const allowedTypes: Record<string, string> = {
          "image/jpeg": ".jpg",
          "image/png": ".png",
          "image/webp": ".webp",
        };

        const extension = allowedTypes[profilePic.type];

        if (!extension || profilePic.size > 5 * 1024 * 1024) {
          return c.json({ success: false, error: "invalidImage" }, 400);
        }

        // Convert image to Buffer
        const buffer = Buffer.from(await profilePic.arrayBuffer());

        // Generate unique filename
        const fileName = `${randomUUID()}${extension}`;

        // Prepare upload directory
        const uploadDir = path.join(process.cwd(), "uploads", "avatars");

        await mkdir(uploadDir, { recursive: true });

        // Save image
        uploadedFilePath = path.join(uploadDir, fileName);

        await writeFile(uploadedFilePath, buffer);

        // Include profile picture in update
        updateData.profilePic = fileName;
      }
    }

    // Update user profile
    const [updatedProfile] = await db
      .update(userProfile)
      .set(updateData)
      .where(eq(userProfile.userId, user.id))
      .returning({ userId: userProfile.userId });

    if (!updatedProfile) {
      if (uploadedFilePath) {
        await unlink(uploadedFilePath).catch(() => {});
      }

      return c.json({ success: false, error: "profileNotFound" }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    // Remove newly uploaded file if the operation fails
    if (uploadedFilePath) {
      await unlink(uploadedFilePath).catch(() => {});
    }

    console.error("Profile update error:", error);

    return c.json({ success: false, error: "serverSideError" }, 500);
  }
});

// Delete profile picture
app.delete("/api/me/profile", async (c) => {
  try {
    // Get JWT token from cookie
    const payload = c.get("jwtPayload");

    // Access user by token from DB
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.sub));

    // If user was not found
    if (!user) {
      return c.json({ success: false, error: "userNotFound" }, 404);
    }

    const [userProfileData] = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, user.id));

    if (!userProfileData) {
      return c.json({ success: false, error: "profileNotFound" }, 404);
    }

    if (!userProfileData.profilePic) {
      return c.json({ success: false, error: "profilePictureNotExists" }, 404);
    }

    // Get path for file
    const filePath = path.join(
      process.cwd(),
      "uploads",
      "avatars",
      userProfileData.profilePic,
    );

    try {
      await unlink(filePath);

      // Remove image record from DB
      await db
        .update(userProfile)
        .set({ profilePic: null })
        .where(eq(userProfile.userId, user.id));
    } catch (error) {
      return c.json({ success: false, error: "errorWhenDeletingImage" }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: "serverSideError" }, 500);
  }
});

// Get bio data (The one that powers recomendations) of authenticated user
app.get("/api/me/bio", async (c) => {
  try {
    // Get JWT token from cookie
    const payload = c.get("jwtPayload");

    // Access user by token from DB
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.sub));

    // If user was not found
    if (!user) {
      return c.json({ success: false, error: "userNotFound" }, 404);
    }

    // Get user bio
    const [userBioInfo] = await db
      .select()
      .from(userBio)
      .where(eq(userBio.userId, user.id));

    // If no bio found -> User didnt set it up -> Redirect to setup page
    if (!userBioInfo) {
      return c.json({ success: false, error: "noBioFound" }, 404);
    }

    return c.json({ success: true, bio: userBioInfo });
  } catch (error) {
    return c.json({ success: false, error: "serverSideError" }, 500);
  }
});

// Change bio data
app.patch("/api/me/bio", async (c) => {
  try {
    // Get JWT token from cookie
    const payload = c.get("jwtPayload");

    // Get and validate JSON payload
    const {
      music,
      food,
      location,
      walks,
      travel,
      hobbies,
      interests,
    }: {
      music: string;
      food: string;
      location: string;
      walks: string;
      travel: string;
      hobbies: string[];
      interests: string[];
    } = await c.req.json();

    if (!music) {
      return c.json({ success: false, errorField: "music" }, 400);
    } else if (!food) {
      return c.json({ success: false, errorField: "food" }, 400);
    } else if (!location) {
      return c.json({ success: false, errorField: "location" }, 400);
    } else if (!walks) {
      return c.json({ success: false, errorField: "walks" }, 400);
    } else if (!travel) {
      return c.json({ success: false, errorField: "travel" }, 400);
    } else if (!hobbies || !hobbies.length) {
      return c.json({ success: false, errorField: "hobbies" }, 400);
    } else if (!interests || !interests.length) {
      return c.json({ success: false, errorField: "interests" }, 400);
    }

    // Access user by token from DB
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.sub));

    // If user was not found
    if (!user) {
      return c.json({ success: false, error: "userNotFound" }, 404);
    }

    // Get user bio
    const [userBioInfo] = await db
      .select()
      .from(userBio)
      .where(eq(userBio.userId, user.id));

    // If no bio found -> User didnt set it up -> Redirect to setup page
    if (!userBioInfo) {
      return c.json({ success: false, error: "noBioFound" }, 404);
    }

    // Update user bio information
    await db
      .update(userBio)
      .set({
        music,
        food,
        travel,
        location,
        hobbies,
        interests,
        walks,
      })
      .where(eq(userBio.userId, user.id));

    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: "serverSideError" }, 500);
  }
});

// Create user bio info
app.post("/api/me/bio", async (c) => {
  try {
    // Get JWT token from cookie
    const payload = c.get("jwtPayload");

    // Access user by token from DB
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.sub));

    // If user was not found
    if (!user) {
      return c.json({ success: false, error: "userNotFound" }, 404);
    }

    // Get json payload
    const { interests, hobbies, walks, travel, location, food, music } =
      await c.req.json();

    if (
      !interests ||
      !interests.length ||
      !hobbies ||
      !hobbies.length ||
      !walks ||
      !travel ||
      !location ||
      !food ||
      !music
    ) {
      return c.json({ success: false, error: "notAllFieldsProvided" }, 400);
    }

    // Create user bio
    await db.insert(userBio).values({
      interests,
      hobbies,
      walks,
      travel,
      location,
      food,
      music,
      userId: user.id,
    });

    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: "serverSideError" }, 500);
  }
});

// Recommendations (Fetch list of recommendations, POST request because it uses JSON)
app.post("/api/recommendations", async (c) => {
  try {
    // Get filters
    const filters: {
      interests: string[];
      hobbies: string[];
      travel: string;
      food: string;
      music: string;
      walks: string;
      location: string[];
    } = await c.req.json();

    // Get authenticated user
    const payload = c.get("jwtPayload");

    // Fetch user
    const [user] = await db
      .select()
      .from(userBio)
      .where(eq(userBio.userId, payload.sub));

    if (!user) {
      return c.json({ success: false, error: "noProfileFound" }, 404);
    }

    // Build filtering conditions
    const filteringConditions: SQL[] = [];

    if (filters.location.length > 0) {
      filteringConditions.push(inArray(userBio.location, filters.location));
    }

    if (filters.interests.length > 0) {
      filteringConditions.push(
        arrayOverlaps(userBio.interests, filters.interests),
      );
    }

    if (filters.hobbies.length > 0) {
      filteringConditions.push(arrayOverlaps(userBio.hobbies, filters.hobbies));
    }

    if (filters.travel) {
      filteringConditions.push(eq(userBio.travel, filters.travel));
    }

    if (filters.food) {
      filteringConditions.push(eq(userBio.food, filters.food));
    }

    if (filters.music) {
      filteringConditions.push(eq(userBio.music, filters.music));
    }

    if (filters.walks) {
      filteringConditions.push(eq(userBio.walks, filters.walks));
    }

    // If conditions is empty -> Return nothing
    if (filteringConditions.length === 0) {
      return c.json({ success: true, recommendations: [] });
    }

    const existingConnection = db
      .select({ id: connections.id })
      .from(connections)
      .where(
        or(
          and(
            eq(connections.senderId, payload.sub),
            eq(connections.receiverId, userBio.userId),
          ),
          and(
            eq(connections.receiverId, payload.sub),
            eq(connections.senderId, userBio.userId),
          ),
        ),
      );

    // Query db
    const candidates = await db
      .select()
      .from(userBio)
      .where(
        and(
          ne(userBio.userId, String(payload.sub)),
          notExists(existingConnection),
          or(...filteringConditions),
        ),
      );

    if (!candidates.length) {
      return c.json({ success: true, recommendations: [] });
    }

    // Cycle through query result and calculate rec score
    const arrayOfCandidatesWithPoints = candidates.map((item) => {
      let score = 0;

      item.interests.forEach((interest) => {
        if (filters.interests.includes(interest)) {
          score++;
        }
      });

      item.hobbies.forEach((hobby) => {
        if (filters.hobbies.includes(hobby)) {
          score++;
        }
      });

      if (item.food === filters.food) {
        score++;
      }

      if (item.music === filters.music) {
        score++;
      }

      if (item.travel === filters.travel) {
        score++;
      } else if (item.travel === "maybe") {
        score = score + 0.5;
      }

      if (item.walks === filters.walks) {
        score++;
      } else if (item.walks === "sometimes") {
        score = score + 0.5;
      }

      // If some filters by location were provided and location of item is the same as location of user -> Give 2 points for it
      // So basically if user is from Estonia and included Estonia in location prefs -> It will give 2 points
      if (filters.location.length > 0) {
        if (
          item.location === user.location &&
          filters.location.includes(item.location)
        ) {
          score += 2;
        }
      }

      return {
        recScore: score,
        ...item,
      };
    });

    const sortedCandidates = arrayOfCandidatesWithPoints.sort(
      (a, b) => b.recScore - a.recScore,
    );

    // Return only ID of sorted candidates
    const sortedCandidatesIds = sortedCandidates.map((item) => {
      return {
        id: item.userId,
      };
    });

    return c.json({ success: true, recommendations: sortedCandidatesIds });
  } catch (error) {
    console.log(error);
    return c.json({ success: false, error: "serverSideError" }, 500);
  }
});

// Get name and picture
app.get("/api/users/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const [userData] = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, id));

    if (!userData) {
      return c.json({ success: false, error: "userNotFound" }, 404);
    }

    return c.json({
      success: true,
      userProfileData: {
        firstname: userData.firstname,
        lastname: userData.lastname,
        profilePic: userData.profilePic,
        id,
      },
    });
  } catch (error) {
    return c.json({ success: false, error: "serverSideError" }, 500);
  }
});

// Get bio data
app.get("/api/users/:id/bio", async (c) => {
  try {
    const id = c.req.param("id");

    const [userBioData] = await db
      .select()
      .from(userBio)
      .where(eq(userBio.userId, id));

    if (!userBioData) {
      return c.json({ success: false, error: "userNotFound" }, 404);
    }

    return c.json({
      success: true,
      userBio: {
        ...userBioData,
        id,
      },
    });
  } catch (error) {
    return c.json({ success: false, error: "serverSideError" }, 500);
  }
});

// Handle connection request
app.post("/api/connections", async (c) => {
  try {
    // Get JWT token from cookie
    const payload = c.get("jwtPayload");

    // Access user by token from DB
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.sub));

    // If user was not found
    if (!user) {
      return c.json({ success: false, error: "userNotFound" }, 404);
    }

    // Get json
    const jsonPayload: {
      connectTo: string;
      do: "requestConnection" | "dismiss";
    } = await c.req.json();

    if (
      !jsonPayload ||
      !jsonPayload.do ||
      !jsonPayload.connectTo ||
      typeof jsonPayload.connectTo !== "string" ||
      typeof jsonPayload.do !== "string"
    ) {
      return c.json({ success: false, error: "badJsonBody" }, 400);
    }

    // Check if user to whom user wish send connection request / dismiss does exists
    const [userToConnectWith] = await db
      .select()
      .from(users)
      .where(eq(users.id, jsonPayload.connectTo));

    if (!userToConnectWith) {
      return c.json({ success: false, error: "noUserToConnectWithFound" }, 404);
    }

    // Handle connection request
    if (jsonPayload.do === "requestConnection") {
      // Check if other user already sent connection request -> If so it will be accepted
      const [existingConnectionRequest] = await db
        .select()
        .from(connections)
        .where(
          and(
            eq(connections.senderId, userToConnectWith.id),
            eq(connections.receiverId, user.id),
          ),
        );

      if (existingConnectionRequest) {
        await db
          .update(connections)
          .set({ status: "accepted" })
          .where(eq(connections.id, existingConnectionRequest.id));

        return c.json({ success: true });
      }

      await db
        .insert(connections)
        .values({ senderId: user.id, receiverId: userToConnectWith.id });

      return c.json({ success: true });

      // Handle dismiss
    } else if (jsonPayload.do === "dismiss") {
      // Set connection status as dismissed
      await db.insert(connections).values({
        senderId: user.id,
        receiverId: userToConnectWith.id,
        status: "dismissed",
      });

      return c.json({ success: true });
    } else {
      return c.json({ success: false, error: "badJsonBody" }, 400);
    }
  } catch (error) {
    return c.json({ success: false, error: "serverSideError" }, 500);
  }
});

// Get connections
app.get("/api/connections", async (c) => {
  try {
    // Get JWT token from cookie
    const payload = c.get("jwtPayload");

    // Access user by token from DB
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.sub));

    // If user was not found
    if (!user) {
      return c.json({ success: false, error: "userNotFound" }, 404);
    }

    // Get list of pending connections
    const pendingConnections = await db
      .select()
      .from(connections)
      .where(
        and(
          eq(connections.receiverId, user.id),
          eq(connections.status, "pending"),
        ),
      );

    // Get list of connected people
    const connectedPeople = await db
      .select()
      .from(connections)
      .where(
        and(
          eq(connections.status, "accepted"),
          or(
            eq(connections.receiverId, user.id),
            eq(connections.senderId, user.id),
          ),
        ),
      )
      .orderBy(sql`${connections.lastMessageTimestamp} DESC NULLS LAST`);

    // Change connected people list to only contain another profile id
    const connectedPeopleProfileIds = connectedPeople.map((item) => {
      let profileId;

      if (item.receiverId === user.id) {
        profileId = item.senderId;
      } else {
        profileId = item.receiverId;
      }

      return {
        connectionId: item.id,
        profileId,
      };
    });

    return c.json({
      success: true,
      pending: pendingConnections,
      connected: connectedPeopleProfileIds,
    });
  } catch (error) {
    console.log(error);
    return c.json({ success: false, error: "serverSideError" }, 500);
  }
});

// Fetch messages of particular connection
app.get("/api/connections/:connectionId/:page", async (c) => {
  try {
    // Get JWT token from cookie
    const payload = c.get("jwtPayload");

    // Access user by token from DB
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.sub));

    // If user was not found
    if (!user) {
      return c.json({ success: false, error: "userNotFound" }, 404);
    }

    // Get params
    const connectionId = c.req.param("connectionId");
    const page = c.req.param("page");

    if (
      !connectionId ||
      typeof connectionId !== "string" ||
      !page ||
      typeof page !== "string" ||
      typeof +page !== "number"
    ) {
      return c.json({ success: false, error: "badParams" }, 400);
    }

    // Get connection
    const [connection] = await db
      .select()
      .from(connections)
      .where(
        and(
          eq(connections.id, connectionId),
          eq(connections.status, "accepted"),
          or(
            eq(connections.senderId, user.id),
            eq(connections.receiverId, user.id),
          ),
        ),
      );

    // Calculate offset (Fetch 10 messages at once)
    const offset = 10 * +page;
    const limit = 10;

    // If connection was not found
    if (!connection) {
      return c.json({ success: false, error: "chatNotFound" }, 404);
    }

    // Fetch messages of this connection
    const messagesOfConnection = await db
      .select()
      .from(messages)
      .where(eq(messages.connectionId, connection.id))
      .orderBy(desc(messages.createdAt))
      .offset(offset)
      .limit(limit + 1);

    // Check if more messages exists
    const canFetchMore = messagesOfConnection.length > limit;

    return c.json({
      success: true,
      messages: messagesOfConnection.slice(0, limit).reverse(),
      canFetchMore,
      currentUser: user.id,
    });
  } catch (error) {
    return c.json({ success: false, error: "serverSideError" }, 500);
  }
});

// Handle connection accept / decline
app.patch("/api/connections", async (c) => {
  try {
    // Get JWT token from cookie
    const payload = c.get("jwtPayload");

    // Access user by token from DB
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.sub));

    // If user was not found
    if (!user) {
      return c.json({ success: false, error: "userNotFound" }, 404);
    }

    // Get json payload
    const allowedConnectionStatus = ["accepted", "dismissed"];
    const jsonPayload = await c.req.json();

    if (!allowedConnectionStatus.includes(jsonPayload.connectionStatus)) {
      return c.json({ success: false, error: "badJsonBody" }, 400);
    }

    // Check if user to whom user wish send connection request / dismiss does exists
    const [userToConnectWith] = await db
      .select()
      .from(users)
      .where(eq(users.id, jsonPayload.connectionWith));

    if (!userToConnectWith) {
      return c.json({ success: false, error: "noUserToConnectWithFound" }, 404);
    }

    await db
      .update(connections)
      .set({ status: jsonPayload.connectionStatus })
      .where(
        and(
          eq(connections.receiverId, user.id),
          eq(connections.senderId, userToConnectWith.id),
        ),
      );

    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: "serverSideError" }, 500);
  }
});

// Handle disconnect
app.delete("/api/connections/:connectionId", async (c) => {
  try {
    // Get JWT token from cookie
    const payload = c.get("jwtPayload");

    // Access user by token from DB
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.sub));

    // If user was not found
    if (!user) {
      return c.json({ success: false, error: "userNotFound" }, 404);
    }

    // Validate params
    const connectionToDelete = c.req.param("connectionId");

    const [deletedConnection] = await db
      .delete(connections)
      .where(
        and(
          eq(connections.id, connectionToDelete),
          or(
            eq(connections.senderId, user.id),
            eq(connections.receiverId, user.id),
          ),
        ),
      )
      .returning({ id: connections.id });

    if (!deletedConnection) {
      return c.json({ success: false, error: "connectionNotFound" }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log(error);
    return c.json({ success: false, error: "serverSideError" }, 500);
  }
});

// Fetch notifications
app.get("/api/notifications", async (c) => {
  try {
    // Get JWT token from cookie
    const payload = c.get("jwtPayload");

    // Access user by token from DB
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.sub));

    // If user was not found
    if (!user) {
      return c.json({ success: false, error: "userNotFound" }, 404);
    }

    // Get all notifications of user
    const notifications = await db
      .select({
        messageFrom: messagesNotifications.messageFrom,
        unreadCount: count(),
      })
      .from(messagesNotifications)
      .where(eq(messagesNotifications.messageTo, user.id))
      .groupBy(messagesNotifications.messageFrom);

    return c.json({ success: true, notifications });
  } catch (error) {
    return c.json({ success: false, error: "serverSideError" }, 500);
  }
});

// Remove notifications (When chat is opened) (Removing by sender id)
app.delete("/api/notifications/:senderId", async (c) => {
  try {
    // Get JWT token from cookie
    const payload = c.get("jwtPayload");

    // Access user by token from DB
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.sub));

    // If user was not found
    if (!user) {
      return c.json({ success: false, error: "userNotFound" }, 404);
    }

    const senderId = c.req.param("senderId");

    if (!senderId || typeof senderId !== "string") {
      return c.json({ success: false, error: "badRequest" }, 400);
    }

    // Check for connection of those two users
    const [connection] = await db
      .select()
      .from(connections)
      .where(
        and(
          or(
            eq(connections.senderId, user.id),
            eq(connections.receiverId, user.id),
          ),
        ),
      );

    // If those two users were not connected
    if (!connection) {
      return c.json({ success: false, error: "connectionNotFound" }, 404);
    }

    // Delete notifications
    await db
      .delete(messagesNotifications)
      .where(
        and(
          eq(messagesNotifications.messageFrom, senderId),
          eq(messagesNotifications.messageTo, user.id),
        ),
      );

    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: "serverSideError" }, 500);
  }
});

// Web sockets route
app.get(
  "/ws",
  upgradeWebSocket((c) => {
    // Get user id
    const jwtPayload = c.get("jwtPayload") as JwtPayload;
    const userId = jwtPayload.sub;

    let registeredSocket: WSContext | undefined;

    return {
      onOpen(event, ws) {
        if (!connectedUsers.has(userId)) {
          connectedUsers.set(userId, new Set());
        }

        connectedUsers.get(userId)!.add(ws);
        registeredSocket = ws;

        console.log("Connected:", userId);
      },

      async onMessage(event, ws) {
        try {
          const payload = JSON.parse(event.data.toString());

          // Handle events
          switch (payload.type) {
            // Handle incoming message from client
            case "send-message":
              // Get connection
              const [connection] = await db
                .select()
                .from(connections)
                .where(
                  and(
                    eq(connections.id, payload.data.connectionId),
                    eq(connections.status, "accepted"),
                    or(
                      eq(connections.senderId, userId),
                      eq(connections.receiverId, userId),
                    ),
                  ),
                );

              if (!connection) {
                ws.send(
                  JSON.stringify({
                    type: "error",
                    error: "connectionNotFound",
                  }),
                );

                break;
              }

              // Get id of recepient
              const recipientId =
                connection.senderId === userId
                  ? connection.receiverId
                  : connection.senderId;

              // Store message in DB
              const [message] = await db
                .insert(messages)
                .values({
                  connectionId: connection.id,
                  senderId: userId,
                  content: payload.data.value,
                })
                .returning();

              // Change last message timestamp in this connection
              await db
                .update(connections)
                .set({ lastMessageTimestamp: new Date() })
                .where(eq(connections.id, connection.id));

              // Store notification (To recipient)
              await db.insert(messagesNotifications).values({
                messageFrom: userId,
                messageTo: recipientId,
                connectionId: connection.id,
              });

              // Send event to browser
              const event = {
                type: "new-message",
                data: {
                  message,
                  currentUser: userId,
                },
              };

              sendToUser(recipientId, event);
              sendToUser(userId, event);
              break;
          }
        } catch (error) {
          ws.send(
            JSON.stringify({
              type: "error",
              error: "invalidPayload",
            }),
          );
        }
      },

      onClose(event, ws) {
        const sockets = connectedUsers.get(userId);

        if (registeredSocket) {
          sockets?.delete(registeredSocket);
        }

        if (sockets?.size === 0) {
          connectedUsers.delete(userId);
        }

        console.log("Disconnected:", userId);
      },

      onError(event, ws) {
        console.log("WebSocket error:", event);
      },
    };
  }),
);

const wss = new WebSocketServer({
  noServer: true,
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
    websocket: {
      server: wss,
    },
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

// Function to send message to user
function sendToUser(userId: string, payload: object) {
  const sockets = connectedUsers.get(userId);

  if (!sockets) return;

  const message = JSON.stringify(payload);

  for (const socket of sockets) {
    if (socket.readyState === 1) {
      socket.send(message);
    }
  }
}
