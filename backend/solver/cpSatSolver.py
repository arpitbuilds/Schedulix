# # import sys
# # import json
# # from ortools.sat.python import cp_model

# # DAY_NAMES = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

# # def main():

# #     input_data = json.load(sys.stdin)

# #     teachers = input_data["teachers"]
# #     subjects = input_data["subjects"]
# #     rooms = input_data["rooms"]

# #     days = input_data.get("days",5)
# #     periods = input_data.get("periodsPerDay",8)
# #     break_slots = set(input_data.get("breakSlots",[4]))

# #     model = cp_model.CpModel()

# #     T = len(teachers)
# #     S = len(subjects)
# #     R = len(rooms)

# #     x = {}

# #     # -------------------------
# #     # Decision variables
# #     # -------------------------

# #     for t in range(T):
# #         for s in range(S):
# #             for r in range(R):
# #                 for d in range(days):
# #                     for p in range(periods):

# #                         if p in break_slots:
# #                             continue

# #                         x[(t,s,r,d,p)] = model.NewBoolVar(f"x_{t}_{s}_{r}_{d}_{p}")

# #     # -------------------------
# #     # Teacher clash
# #     # -------------------------

# #     for t in range(T):
# #         for d in range(days):
# #             for p in range(periods):

# #                 if p in break_slots:
# #                     continue

# #                 vars = []

# #                 for s in range(S):
# #                     for r in range(R):
# #                         if (t,s,r,d,p) in x:
# #                             vars.append(x[(t,s,r,d,p)])

# #                 if vars:
# #                     model.Add(sum(vars) <= 1)

# #     # -------------------------
# #     # Room clash
# #     # -------------------------

# #     for r in range(R):
# #         for d in range(days):
# #             for p in range(periods):

# #                 if p in break_slots:
# #                     continue

# #                 vars = []

# #                 for t in range(T):
# #                     for s in range(S):
# #                         if (t,s,r,d,p) in x:
# #                             vars.append(x[(t,s,r,d,p)])

# #                 if vars:
# #                     model.Add(sum(vars) <= 1)

# #     # -------------------------
# #     # Subject weekly hours
# #     # -------------------------

# #     for s in range(S):

# #         weekly = subjects[s].get("weeklyHours",3)

# #         vars = []

# #         for t in range(T):
# #             for r in range(R):
# #                 for d in range(days):
# #                     for p in range(periods):

# #                         if (t,s,r,d,p) in x:
# #                             vars.append(x[(t,s,r,d,p)])

# #         model.Add(sum(vars) == weekly)

# #     # -------------------------
# #     # Teacher subject compatibility
# #     # -------------------------

# #     for t in range(T):

# #         allowed = set()

# #         for sub in teachers[t].get("subjects",[]):
# #             allowed.add(str(sub["subjectId"]))

# #         for s in range(S):

# #             if str(subjects[s]["id"]) not in allowed:

# #                 for r in range(R):
# #                     for d in range(days):
# #                         for p in range(periods):

# #                             if (t,s,r,d,p) in x:
# #                                 model.Add(x[(t,s,r,d,p)] == 0)

# #     # -------------------------
# #     # Lab constraint
# #     # -------------------------

# #     for s in range(S):

# #         if subjects[s].get("requiresLab", False):

# #             duration = subjects[s].get("labDuration",2)

# #             # labs only in lab rooms
# #             for r in range(R):

# #                 if rooms[r]["type"].lower() != "lab":

# #                     for t in range(T):
# #                         for d in range(days):
# #                             for p in range(periods):

# #                                 if (t,s,r,d,p) in x:
# #                                     model.Add(x[(t,s,r,d,p)] == 0)

# #             # enforce consecutive slots
# #             for t in range(T):
# #                 for r in range(R):
# #                     for d in range(days):
# #                         for p in range(periods-duration+1):

# #                             block = []
# #                             valid = True

# #                             for i in range(duration):

# #                                 key = (t,s,r,d,p+i)

# #                                 if key not in x:
# #                                     valid = False
# #                                     break

# #                                 block.append(x[key])

# #                             if valid:
# #                                 for i in range(1,duration):
# #                                     model.Add(block[0] <= block[i])

# #     # -------------------------
# #     # Theory subjects cannot use labs
# #     # -------------------------

# #     for s in range(S):

# #         if not subjects[s].get("requiresLab", False):

# #             for r in range(R):

# #                 if rooms[r]["type"].lower() == "lab":

# #                     for t in range(T):
# #                         for d in range(days):
# #                             for p in range(periods):

# #                                 if (t,s,r,d,p) in x:
# #                                     model.Add(x[(t,s,r,d,p)] == 0)

# #     # -------------------------
# #     # Teacher max hours per day
# #     # -------------------------

# #     for t in range(T):

# #         maxh = teachers[t].get("maxHoursPerDay",6)

# #         for d in range(days):

# #             vars = []

# #             for s in range(S):
# #                 for r in range(R):
# #                     for p in range(periods):

# #                         if (t,s,r,d,p) in x:
# #                             vars.append(x[(t,s,r,d,p)])

# #             if vars:
# #                 model.Add(sum(vars) <= maxh)

# #     # -------------------------
# #     # Teacher availability
# #     # -------------------------

# #     DAY_MAP = {d:i for i,d in enumerate(DAY_NAMES)}

# #     for t in range(T):

# #         allowed = set()

# #         for item in teachers[t].get("availability",[]):

# #             day = DAY_MAP.get(item["day"])

# #             for slot in item["slots"]:
# #                 allowed.add((day,int(slot)))

# #         if allowed:

# #             for s in range(S):
# #                 for r in range(R):
# #                     for d in range(days):
# #                         for p in range(periods):

# #                             if (t,s,r,d,p) in x and (d,p) not in allowed:
# #                                 model.Add(x[(t,s,r,d,p)] == 0)

# #     # -------------------------
# #     # Objective (spread lectures)
# #     # -------------------------

# #     penalties = []

# #     for s in range(S):

# #         day_vars = []

# #         for d in range(days):

# #             var = model.NewBoolVar(f"subject_{s}_day_{d}")

# #             entries = []

# #             for t in range(T):
# #                 for r in range(R):
# #                     for p in range(periods):

# #                         if (t,s,r,d,p) in x:
# #                             entries.append(x[(t,s,r,d,p)])

# #             if entries:

# #                 model.Add(sum(entries) > 0).OnlyEnforceIf(var)
# #                 model.Add(sum(entries) == 0).OnlyEnforceIf(var.Not())

# #             day_vars.append(var)

# #         penalties.append(sum(day_vars))

# #     model.Maximize(sum(penalties))

# #     # -------------------------
# #     # Solve
# #     # -------------------------

# #     solver = cp_model.CpSolver()
# #     solver.parameters.max_time_in_seconds = 30

# #     status = solver.Solve(model)

# #     if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):

# #         print(json.dumps({
# #             "timetable":[],
# #             "conflicts":["No feasible solution"],
# #             "score":0
# #         }))
# #         return

# #     timetable = []

# #     for (t,s,r,d,p),var in x.items():

# #         if solver.Value(var)==1:

# #             timetable.append({
# #                 "teacherId":teachers[t]["id"],
# #                 "subjectId":subjects[s]["id"],
# #                 "roomId":rooms[r]["id"],
# #                 "day":DAY_NAMES[d],
# #                 "slot":p
# #             })

# #     print(json.dumps({
# #         "timetable":timetable,
# #         "conflicts":[],
# #         "score":solver.ObjectiveValue()
# #     }))


# # if __name__=="__main__":
# #     main()

# import sys
# import json
# from ortools.sat.python import cp_model

# DAY_NAMES = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

# def main():

#     input_data = json.load(sys.stdin)

#     teachers = input_data["teachers"]
#     subjects = input_data["subjects"]
#     rooms = input_data["rooms"]

#     days = input_data.get("days",5)
#     periods = input_data.get("periodsPerDay",8)
#     break_slots = set(input_data.get("breakSlots",[]))

#     model = cp_model.CpModel()

#     T = len(teachers)
#     S = len(subjects)
#     R = len(rooms)

#     valid_periods = [p for p in range(periods) if p not in break_slots]

#     x = {}

#     # -------------------------
#     # Decision Variables
#     # -------------------------

#     for t in range(T):
#         for s in range(S):
#             for r in range(R):
#                 for d in range(days):
#                     for p in valid_periods:

#                         x[(t,s,r,d,p)] = model.NewBoolVar(
#                             f"x_{t}_{s}_{r}_{d}_{p}"
#                         )

#     # -------------------------
#     # Teacher clash
#     # -------------------------

#     for t in range(T):
#         for d in range(days):
#             for p in valid_periods:

#                 vars = []

#                 for s in range(S):
#                     for r in range(R):
#                         if (t,s,r,d,p) in x:
#                             vars.append(x[(t,s,r,d,p)])

#                 if vars:
#                     model.Add(sum(vars) <= 1)

#     # -------------------------
#     # Room clash
#     # -------------------------

#     for r in range(R):
#         for d in range(days):
#             for p in valid_periods:

#                 vars = []

#                 for t in range(T):
#                     for s in range(S):
#                         if (t,s,r,d,p) in x:
#                             vars.append(x[(t,s,r,d,p)])

#                 if vars:
#                     model.Add(sum(vars) <= 1)

#     # -------------------------
#     # Subject weekly hours
#     # (soft constraint)
#     # -------------------------

#     for s in range(S):

#         weekly = subjects[s].get("weeklyHours",3)

#         vars = []

#         for t in range(T):
#             for r in range(R):
#                 for d in range(days):
#                     for p in valid_periods:

#                         if (t,s,r,d,p) in x:
#                             vars.append(x[(t,s,r,d,p)])

#         if vars:
#             model.Add(sum(vars) <= weekly)

#     # -------------------------
#     # Teacher subject compatibility
#     # -------------------------

#     for t in range(T):

#         allowed = set()

#         for sub in teachers[t].get("subjects",[]):
#             allowed.add(str(sub["subjectId"]))

#         for s in range(S):

#             if str(subjects[s]["id"]) not in allowed:

#                 for r in range(R):
#                     for d in range(days):
#                         for p in valid_periods:

#                             if (t,s,r,d,p) in x:
#                                 model.Add(x[(t,s,r,d,p)] == 0)

#     # -------------------------
#     # Lab constraints
#     # -------------------------

#     for s in range(S):

#         if subjects[s].get("requiresLab",False):

#             duration = subjects[s].get("labDuration",2)

#             for r in range(R):

#                 if rooms[r]["type"].lower() != "lab":

#                     for t in range(T):
#                         for d in range(days):
#                             for p in valid_periods:

#                                 if (t,s,r,d,p) in x:
#                                     model.Add(x[(t,s,r,d,p)] == 0)

#             # consecutive slots
#             for t in range(T):
#                 for r in range(R):
#                     for d in range(days):
#                         for p in valid_periods:

#                             if p + duration > periods:
#                                 continue

#                             block = []

#                             valid = True

#                             for i in range(duration):

#                                 key = (t,s,r,d,p+i)

#                                 if key not in x:
#                                     valid = False
#                                     break

#                                 block.append(x[key])

#                             if valid:
#                                 for i in range(1,duration):
#                                     model.Add(block[i] == block[0])

#     # -------------------------
#     # Teacher max hours per day
#     # -------------------------

#     for t in range(T):

#         maxh = teachers[t].get("maxHoursPerDay",6)

#         for d in range(days):

#             vars = []

#             for s in range(S):
#                 for r in range(R):
#                     for p in valid_periods:

#                         if (t,s,r,d,p) in x:
#                             vars.append(x[(t,s,r,d,p)])

#             if vars:
#                 model.Add(sum(vars) <= maxh)

#     # -------------------------
#     # Teacher availability
#     # -------------------------

#     DAY_MAP = {d:i for i,d in enumerate(DAY_NAMES)}

#     for t in range(T):

#         availability = teachers[t].get("availability",[])

#         if not availability:
#             continue

#         allowed = set()

#         for item in availability:

#             day = DAY_MAP.get(item["day"])

#             for slot in item["slots"]:
#                 allowed.add((day,int(slot)))

#         for s in range(S):
#             for r in range(R):
#                 for d in range(days):
#                     for p in valid_periods:

#                         if (t,s,r,d,p) in x and (d,p) not in allowed:
#                             model.Add(x[(t,s,r,d,p)] == 0)

#     # -------------------------
#     # Objective
#     # maximize scheduled classes
#     # -------------------------

#     model.Maximize(sum(x.values()))

#     # -------------------------
#     # Solve
#     # -------------------------

#     solver = cp_model.CpSolver()
#     solver.parameters.max_time_in_seconds = 20

#     status = solver.Solve(model)

#     if status not in (cp_model.OPTIMAL,cp_model.FEASIBLE):

#         print(json.dumps({
#             "timetable":[],
#             "conflicts":["No feasible solution"],
#             "score":0
#         }))
#         return

#     timetable = []

#     for (t,s,r,d,p),var in x.items():

#         if solver.Value(var)==1:

#             timetable.append({
#                 "teacherId":teachers[t]["id"],
#                 "subjectId":subjects[s]["id"],
#                 "roomId":rooms[r]["id"],
#                 "day":DAY_NAMES[d],
#                 "slot":p
#             })

#     print(json.dumps({
#         "timetable":timetable,
#         "conflicts":[],
#         "score":solver.ObjectiveValue()
#     }))


# if __name__=="__main__":
#     main()

import sys
import json
from ortools.sat.python import cp_model

DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]


def as_int(value, default=0):
    try:
        return int(value)
    except Exception:
        return default


def normalize_slots(slots):
    out = set()
    for slot in slots or []:
        try:
            out.add(int(slot))
        except Exception:
            pass
    return out


def main():
    input_data = json.load(sys.stdin)

    teachers = input_data.get("teachers", [])
    subjects = input_data.get("subjects", [])
    rooms = input_data.get("rooms", [])
    constraints = input_data.get("constraints", [])

    days = as_int(input_data.get("days", 5), 5)
    periods = as_int(input_data.get("periodsPerDay", 8), 8)
    break_slots = normalize_slots(input_data.get("breakSlots", []))

    semester = input_data.get("semester")
    section = str(input_data.get("section", "A")).strip().upper() or "A"

    # 1-based slots to match frontend/backend admin inputs
    valid_periods = [p for p in range(1, periods + 1) if p not in break_slots]
    active_day_names = DAY_NAMES[:days]
    day_index_to_name = {i: active_day_names[i] for i in range(days)}
    day_name_to_index = {name: idx for idx, name in day_index_to_name.items()}

    model = cp_model.CpModel()

    T = len(teachers)
    S = len(subjects)
    R = len(rooms)

    # -------------------------
    # Decision variables
    # x[t, s, r, d, p] = teacher t teaches subject s in room r on day d slot p
    # -------------------------
    x = {}
    for t in range(T):
        for s in range(S):
            for r in range(R):
                for d in range(days):
                    for p in valid_periods:
                        x[(t, s, r, d, p)] = model.NewBoolVar(f"x_{t}_{s}_{r}_{d}_{p}")

    # -------------------------
    # Teacher clash
    # A teacher cannot teach more than one class in the same slot
    # -------------------------
    for t in range(T):
        for d in range(days):
            for p in valid_periods:
                vars_at_slot = [
                    x[(t, s, r, d, p)]
                    for s in range(S)
                    for r in range(R)
                    if (t, s, r, d, p) in x
                ]
                if vars_at_slot:
                    model.Add(sum(vars_at_slot) <= 1)

    # -------------------------
    # Room clash
    # A room cannot host more than one class in the same slot
    # -------------------------
    for r in range(R):
        for d in range(days):
            for p in valid_periods:
                vars_at_slot = [
                    x[(t, s, r, d, p)]
                    for t in range(T)
                    for s in range(S)
                    if (t, s, r, d, p) in x
                ]
                if vars_at_slot:
                    model.Add(sum(vars_at_slot) <= 1)

    # -------------------------
    # Section clash
    # THIS IS THE BIG FIX:
    # For one section timetable, at most one class can happen in a slot.
    # -------------------------
    for d in range(days):
        for p in valid_periods:
            vars_at_slot = [
                x[(t, s, r, d, p)]
                for t in range(T)
                for s in range(S)
                for r in range(R)
                if (t, s, r, d, p) in x
            ]
            if vars_at_slot:
                model.Add(sum(vars_at_slot) <= 1)

    # -------------------------
    # Teacher subject compatibility
    # Only assigned teachers can teach assigned subjects
    # -------------------------
    for t in range(T):
        allowed_subject_ids = {
            str(sub.get("subjectId"))
            for sub in teachers[t].get("subjects", [])
            if sub.get("subjectId") is not None
        }

        for s in range(S):
            subject_id = str(subjects[s].get("id"))
            if subject_id not in allowed_subject_ids:
                for r in range(R):
                    for d in range(days):
                        for p in valid_periods:
                            if (t, s, r, d, p) in x:
                                model.Add(x[(t, s, r, d, p)] == 0)

    # -------------------------
    # Room type compatibility
    # - Lab subjects only in Lab rooms
    # - Non-lab subjects not in Lab rooms
    # -------------------------
    for s in range(S):
        requires_lab = bool(subjects[s].get("requiresLab", False))

        for r in range(R):
            room_type = str(rooms[r].get("type", "")).strip().lower()
            is_lab_room = room_type == "lab"

            if requires_lab and not is_lab_room:
                for t in range(T):
                    for d in range(days):
                        for p in valid_periods:
                            if (t, s, r, d, p) in x:
                                model.Add(x[(t, s, r, d, p)] == 0)

            if not requires_lab and is_lab_room:
                for t in range(T):
                    for d in range(days):
                        for p in valid_periods:
                            if (t, s, r, d, p) in x:
                                model.Add(x[(t, s, r, d, p)] == 0)

    # -------------------------
    # Teacher max hours per day
    # -------------------------
    for t in range(T):
        max_hours = as_int(teachers[t].get("maxHoursPerDay", 6), 6)

        for d in range(days):
            vars_for_day = [
                x[(t, s, r, d, p)]
                for s in range(S)
                for r in range(R)
                for p in valid_periods
                if (t, s, r, d, p) in x
            ]
            if vars_for_day:
                model.Add(sum(vars_for_day) <= max_hours)

    # -------------------------
    # Teacher availability
    # If availability exists, teacher can only be scheduled in those (day, slot)
    # -------------------------
    for t in range(T):
        availability = teachers[t].get("availability", []) or []

        if not availability:
            continue

        allowed = set()
        for item in availability:
            day_idx = day_name_to_index.get(item.get("day"))
            if day_idx is None:
                continue

            for slot in item.get("slots", []):
                slot_int = as_int(slot, -1)
                if slot_int in valid_periods:
                    allowed.add((day_idx, slot_int))

        for s in range(S):
            for r in range(R):
                for d in range(days):
                    for p in valid_periods:
                        if (t, s, r, d, p) in x and (d, p) not in allowed:
                            model.Add(x[(t, s, r, d, p)] == 0)

    # -------------------------
    # Explicit constraints from backend
    # Interpreted as forbidden day/slot windows
    # Supports: General / Teacher / Room / Subject
    # -------------------------
    for c in constraints:
        ctype = str(c.get("type", "General")).strip()
        cday = c.get("day")
        cslots = normalize_slots(c.get("slots", []))
        cteacher = str(c.get("teacherId")) if c.get("teacherId") is not None else None
        croom = str(c.get("roomId")) if c.get("roomId") is not None else None
        csubject = str(c.get("subjectId")) if c.get("subjectId") is not None else None

        if not cday or cday not in day_name_to_index or not cslots:
            continue

        d = day_name_to_index[cday]
        blocked_slots = [p for p in cslots if p in valid_periods]

        if not blocked_slots:
            continue

        if ctype == "General":
            for t in range(T):
                for s in range(S):
                    for r in range(R):
                        for p in blocked_slots:
                            if (t, s, r, d, p) in x:
                                model.Add(x[(t, s, r, d, p)] == 0)

        elif ctype == "Teacher" and cteacher:
            for t in range(T):
                if str(teachers[t].get("id")) != cteacher:
                    continue
                for s in range(S):
                    for r in range(R):
                        for p in blocked_slots:
                            if (t, s, r, d, p) in x:
                                model.Add(x[(t, s, r, d, p)] == 0)

        elif ctype == "Room" and croom:
            for r in range(R):
                if str(rooms[r].get("id")) != croom:
                    continue
                for t in range(T):
                    for s in range(S):
                        for p in blocked_slots:
                            if (t, s, r, d, p) in x:
                                model.Add(x[(t, s, r, d, p)] == 0)

        elif ctype == "Subject" and csubject:
            for s in range(S):
                if str(subjects[s].get("id")) != csubject:
                    continue
                for t in range(T):
                    for r in range(R):
                        for p in blocked_slots:
                            if (t, s, r, d, p) in x:
                                model.Add(x[(t, s, r, d, p)] == 0)

    # -------------------------
    # Exact subject weekly hours
    # THIS IS IMPORTANT:
    # subject weeklyHours should be fully scheduled, not partially.
    # For labs, the same total slots still apply.
    # -------------------------
    for s in range(S):
        weekly = as_int(subjects[s].get("weeklyHours", 3), 3)
        vars_for_subject = [
            x[(t, s, r, d, p)]
            for t in range(T)
            for r in range(R)
            for d in range(days)
            for p in valid_periods
            if (t, s, r, d, p) in x
        ]

        if vars_for_subject:
            model.Add(sum(vars_for_subject) == weekly)

    # -------------------------
    # Lab consecutive block modeling
    # For lab subjects, schedule them in blocks of labDuration.
    # If weeklyHours is divisible by labDuration, we enforce exact number of starts.
    # -------------------------
    for s in range(S):
        if not bool(subjects[s].get("requiresLab", False)):
            continue

        duration = max(1, as_int(subjects[s].get("labDuration", 2), 2))
        weekly = as_int(subjects[s].get("weeklyHours", duration), duration)

        if duration <= 1:
            continue

        start_vars = {}
        covers = {}

        # Build valid contiguous blocks only if every slot in the block is available
        for t in range(T):
            for r in range(R):
                room_type = str(rooms[r].get("type", "")).strip().lower()
                if room_type != "lab":
                    continue

                for d in range(days):
                    for p in valid_periods:
                        block_slots = list(range(p, p + duration))

                        # block must stay within period range and avoid breaks
                        if block_slots[-1] > periods:
                            continue
                        if any(slot not in valid_periods for slot in block_slots):
                            continue

                        keys = [(t, s, r, d, slot) for slot in block_slots]
                        if not all(key in x for key in keys):
                            continue

                        sv = model.NewBoolVar(f"lab_start_{t}_{s}_{r}_{d}_{p}")
                        start_vars[(t, r, d, p)] = sv

                        for key in keys:
                            covers.setdefault(key, []).append(sv)

        # Link x variables for this subject to the valid starts that cover them
        for t in range(T):
            for r in range(R):
                for d in range(days):
                    for p in valid_periods:
                        key = (t, s, r, d, p)
                        if key not in x:
                            continue

                        cover_list = covers.get(key, [])
                        if cover_list:
                            model.Add(x[key] == sum(cover_list))
                        else:
                            model.Add(x[key] == 0)

        # Number of lab starts
        if weekly % duration == 0 and start_vars:
            model.Add(sum(start_vars.values()) == weekly // duration)

    # -------------------------
    # Objective
    # 1) Spread each subject across more days
    # 2) Add section-specific tie-break bias so A/B/C don't collapse to same schedule
    # -------------------------
    subject_day_vars = []
    for s in range(S):
        for d in range(days):
            used_on_day = model.NewBoolVar(f"subject_{s}_day_{d}")

            entries = [
                x[(t, s, r, d, p)]
                for t in range(T)
                for r in range(R)
                for p in valid_periods
                if (t, s, r, d, p) in x
            ]

            if entries:
                model.Add(sum(entries) >= 1).OnlyEnforceIf(used_on_day)
                model.Add(sum(entries) == 0).OnlyEnforceIf(used_on_day.Not())
                subject_day_vars.append(used_on_day)

    section_bias = sum(ord(ch) for ch in section)
    weighted_slot_terms = []

    for (t, s, r, d, p), var in x.items():
        # Small deterministic bias based on section + slot/day
        # This helps different sections choose different equally valid placements.
        slot_bias = ((section_bias + d * 17 + p * 13) % 7)
        weighted_slot_terms.append((10 + slot_bias) * var)

    model.Maximize(100 * sum(subject_day_vars) + sum(weighted_slot_terms))

    # -------------------------
    # Solve
    # -------------------------
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 30
    solver.parameters.random_seed = section_bias
    solver.parameters.num_search_workers = 8

    status = solver.Solve(model)

    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        print(
            json.dumps(
                {
                    "timetable": [],
                    "conflicts": ["No feasible solution"],
                    "score": 0,
                    "meta": {
                        "semester": semester,
                        "section": section,
                    },
                }
            )
        )
        return

    timetable = []
    for (t, s, r, d, p), var in x.items():
        if solver.Value(var) == 1:
            timetable.append(
                {
                    "teacherId": teachers[t]["id"],
                    "subjectId": subjects[s]["id"],
                    "roomId": rooms[r]["id"],
                    "day": day_index_to_name[d],
                    "slot": p,
                }
            )

    timetable.sort(key=lambda e: (DAY_NAMES.index(e["day"]), e["slot"]))

    print(
        json.dumps(
            {
                "timetable": timetable,
                "conflicts": [],
                "score": solver.ObjectiveValue(),
                "meta": {
                    "semester": semester,
                    "section": section,
                },
            }
        )
    )


if __name__ == "__main__":
    main()