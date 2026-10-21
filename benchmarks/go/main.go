package main

import (
	"fmt"
	"math"
	"os"
	"runtime"
	"strconv"
	"sync"
	"time"
)

const v, R, sigma, half = 0.5, 1.0, 4.0, 2.5

func sech2(u float64) float64 { e := math.Exp(-2 * math.Abs(u)); return 4 * e / ((1 + e) * (1 + e)) }

func rho(x, y float64) float64 {
	r2 := x*x + y*y
	if r2 == 0 {
		return 0
	}
	r := math.Sqrt(r2)
	fp := sigma * (sech2(sigma*(r+R)) - sech2(sigma*(r-R))) / (2 * math.Tanh(sigma*R))
	return -v * v * (y * y / r2) * fp * fp / (32 * math.Pi)
}

func rows(n, j0, j1 int) float64 {
	s, step := 0.0, 2*half/float64(n-1)
	for j := j0; j < j1; j++ {
		y := -half + step*float64(j)
		for i := 0; i < n; i++ {
			s += rho(-half+step*float64(i), y)
		}
	}
	return s
}

func main() {
	n, _ := strconv.Atoi(os.Args[1])
	best1, bestP, sum := math.Inf(1), math.Inf(1), 0.0
	for k := 0; k < 5; k++ {
		t := time.Now()
		sum = rows(n, 0, n)
		best1 = math.Min(best1, time.Since(t).Seconds())
		t = time.Now()
		w := runtime.NumCPU()
		parts := make([]float64, w)
		var wg sync.WaitGroup
		for p := 0; p < w; p++ {
			wg.Add(1)
			go func(p int) { defer wg.Done(); parts[p] = rows(n, p*n/w, (p+1)*n/w) }(p)
		}
		wg.Wait()
		bestP = math.Min(bestP, time.Since(t).Seconds())
	}
	fmt.Printf("go %.3f %.3f %.6e\n", best1*1000, bestP*1000, sum)
}
