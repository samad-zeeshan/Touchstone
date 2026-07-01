# Touchstone

Touchstone is an interactive tutor for computer science ideas that click much
faster once you can watch them run. Instead of only reading about an algorithm,
you step through it, try an answer, and get told exactly where you went wrong.

Each lesson gives you a short problem, grades your answer on the server, and pairs
it with a hands on widget so you can see the idea in motion.

## Live demo

- App: https://touchstone-jade.vercel.app/
- API health check: https://touchstone-api-7z81.onrender.com/health

The backend runs on a free tier that sleeps when idle, so the first request after
a quiet spell takes a few seconds to wake up. After that it is quick.

## The live lessons

Six lessons are live in the app right now. They all sit in the algorithms track
and they are all fully interactive, so you can step through each one and not just
read about it.

- **Binary search.** A million sorted items found in about twenty steps. You watch
  the search window collapse by half on every comparison.
- **Sorting race.** Bubble sort and merge sort run side by side so you can feel the
  gap between slow growth and fast growth.
- **Minimax.** How a game AI picks a move when the opponent is trying to beat it,
  judging each choice by its worst possible reply.
- **Alpha beta pruning.** The same result as minimax while skipping the branches
  that cannot change the outcome, so it explores far fewer positions.
- **Monte Carlo Tree Search.** A smarter kind of trial and error that balances what
  is already winning against what has not been tried enough yet.
- **Frequency analysis.** Breaking a simple cipher by noticing that letter
  frequencies give the hidden shift away.

## How the grading works

When you ask for a problem, the API sends you the question and the numbers but
never the answer. You submit your response and the server grades it, so there is
nothing to peek at in the browser. The piece of code that knows the truth is
called the oracle, and it is the single source of correctness for every lesson.
When you get something wrong, the lesson tries to name the specific mistake you
made instead of just saying no.

There is also an optional AI layer that can reword a problem into a fresh scenario,
but it is never allowed to change a number. If the AI is switched off, or no key
is configured, the app still runs fully on its plain tested wording.

## Tech stack

Backend
- Python with FastAPI
- Each lesson is a small self contained module with its own problem generator,
  grader, and mistake diagnosis

Frontend
- React 19 and TypeScript, built with Vite
- Motion for animation
- A custom interactive widget per lesson, plus light and dark themes

## Continuous integration and delivery

The project is wired so that code moves from a branch all the way to production
with no manual deploy step, and with automated checks guarding every stage.

Continuous integration
- GitHub Actions runs on every pull request and every push to `main`
- It runs the same three checks you would run locally: the backend tests, the
  frontend build, and the frontend lint
- The `main` branch is protected, so every check must pass green before anything
  can merge

Continuous delivery
- Both halves deploy themselves on a push to `main`, through the hosting platforms
  and their native git integrations
- The backend ships as a Docker container on Render, described by `render.yaml`
- The frontend ships as a static build on Vercel
- A health check endpoint and a scheduled keep warm ping watch the running
  backend, with optional error reporting ready to switch on

## How the project is built (SDLC)

The workflow mirrors a normal team software lifecycle at a small scale.

1. Plan a change and make it on its own branch
2. Open a pull request
3. CI runs the tests, the build, and the lint automatically
4. Review and merge into `main` only once everything is green
5. The hosting platforms deploy the new version on their own
6. Health checks confirm the live services are up

Tests are the safety net through all of this. The backend has a pytest suite that
covers the lesson oracles and the problem generators, and it runs both locally and
in CI.

## Running it locally

You need Python 3.12 and Node.

Backend

```
cd backend
python -m venv .venv
.venv/Scripts/activate        # on macOS or Linux use: source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn api:app --reload
```

The API serves on http://localhost:8000, and the interactive docs are at
http://localhost:8000/docs. You do not need any API keys to run it.

Frontend

```
cd frontend
npm install
npm run dev
```

The app opens on http://localhost:5173 and talks to the local backend by default.

## A note on the name

A touchstone is a small dark stone that jewelers once used to test gold. You rub
the metal against it and read the streak it leaves to judge how real it is. That
is the idea here. You try an answer, and you get an honest read on how well you
actually understand the idea.
