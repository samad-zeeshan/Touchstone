LABELS = "ABC"

def children(params: dict) -> list:
    return [[int(params[f"l{i * 3 + j}"]) for j in range(3)] for i in range(3)]

def flatten(grid: list) -> dict:
    return {f"l{i * 3 + j}": grid[i][j] for i in range(3) for j in range(3)}

def minimax_value(grid: list) -> int:
    return max(min(child) for child in grid)

def alphabeta_leaf_count(grid: list) -> int:
    count = 0
    alpha = float("-inf")
    for child in grid:
        val = float("inf")
        for leaf in child:
            count += 1
            val = min(val, leaf)
            if val <= alpha:
                break
        alpha = max(alpha, val)
    return count

def describe(grid: list) -> str:
    return ", ".join(f"Move {LABELS[i]}: {child}" for i, child in enumerate(grid))
