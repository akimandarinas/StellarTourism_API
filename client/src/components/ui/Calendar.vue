<template>
  <div class="p-3">
    <div class="flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0">
      <div class="space-y-4">
        <div class="flex justify-center pt-1 relative items-center">
          <button 
            class="absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-md border border-input"
            @click="prevMonth"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              class="h-4 w-4"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          
          <div class="text-sm font-medium">
            {{ currentMonthName }} {{ currentYear }}
          </div>
          
          <button 
            class="absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-md border border-input"
            @click="nextMonth"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              class="h-4 w-4"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
        
        <div class="w-full border-collapse space-y-1">
          <div class="flex">
            <div v-for="day in weekDays" :key="day" class="text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center">
              {{ day }}
            </div>
          </div>
          
          <div v-for="(week, weekIndex) in calendarDays" :key="weekIndex" class="flex w-full mt-2">
            <div 
              v-for="(day, dayIndex) in week" 
              :key="`${weekIndex}-${dayIndex}`"
              class="h-9 w-9 text-center text-sm p-0 relative"
              :class="getDayClasses(day)"
            >
              <button 
                v-if="day.date" 
                class="h-9 w-9 p-0 font-normal rounded-md"
                :class="getDayButtonClasses(day)"
                @click="selectDate(day.date)"
                :disabled="day.disabled"
              >
                {{ day.date.getDate() }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Calendar',
  props: {
    value: {
      type: Date,
      default: null
    },
    minDate: {
      type: Date,
      default: null
    },
    maxDate: {
      type: Date,
      default: null
    },
    disabledDates: {
      type: Array,
      default: () => []
    },
    showOutsideDays: {
      type: Boolean,
      default: true
    }
  },
  data() {
    const today = new Date()
    return {
      currentMonth: this.value ? this.value.getMonth() : today.getMonth(),
      currentYear: this.value ? this.value.getFullYear() : today.getFullYear(),
      selectedDate: this.value,
      weekDays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    }
  },
  computed: {
    currentMonthName() {
      return new Date(this.currentYear, this.currentMonth, 1).toLocaleString('default', { month: 'long' })
    },
    calendarDays() {
      const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1).getDay()
      const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate()
      const daysInPrevMonth = new Date(this.currentYear, this.currentMonth, 0).getDate()
      
      const days = []
      let week = []
      
      // Previous month days
      if (this.showOutsideDays) {
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
          const date = new Date(this.currentYear, this.currentMonth - 1, daysInPrevMonth - i)
          week.push({
            date,
            currentMonth: false,
            disabled: this.isDateDisabled(date)
          })
        }
      } else {
        for (let i = 0; i < firstDayOfMonth; i++) {
          week.push({ date: null })
        }
      }
      
      // Current month days
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(this.currentYear, this.currentMonth, i)
        week.push({
          date,
          currentMonth: true,
          disabled: this.isDateDisabled(date),
          today: this.isToday(date),
          selected: this.isSelected(date)
        })
        
        if (week.length === 7) {
          days.push(week)
          week = []
        }
      }
      
      // Next month days
      if (week.length > 0) {
        const remainingDays = 7 - week.length
        if (this.showOutsideDays) {
          for (let i = 1; i <= remainingDays; i++) {
            const date = new Date(this.currentYear, this.currentMonth + 1, i)
            week.push({
              date,
              currentMonth: false,
              disabled: this.isDateDisabled(date)
            })
          }
        } else {
          for (let i = 0; i < remainingDays; i++) {
            week.push({ date: null })
          }
        }
        days.push(week)
      }
      
      return days
    }
  },
  methods: {
    prevMonth() {
      if (this.currentMonth === 0) {
        this.currentMonth = 11
        this.currentYear--
      } else {
        this.currentMonth--
      }
    },
    nextMonth() {
      if (this.currentMonth === 11) {
        this.currentMonth = 0
        this.currentYear++
      } else {
        this.currentMonth++
      }
    },
    selectDate(date) {
      if (this.isDateDisabled(date)) return
      
      this.selectedDate = date
      this.$emit('input', date)
    },
    isDateDisabled(date) {
      if (!date) return true
      
      // Check min date
      if (this.minDate && date < this.minDate) return true
      
      // Check max date
      if (this.maxDate && date > this.maxDate) return true
      
      // Check disabled dates
      return this.disabledDates.some(disabledDate => 
        disabledDate.getFullYear() === date.getFullYear() &&
        disabledDate.getMonth() === date.getMonth() &&
        disabledDate.getDate() === date.getDate()
      )
    },
    isToday(date) {
      const today = new Date()
      return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    },
    isSelected(date) {
      if (!this.selectedDate || !date) return false
      
      return date.getDate() === this.selectedDate.getDate() &&
        date.getMonth() === this.selectedDate.getMonth() &&
        date.getFullYear() === this.selectedDate.getFullYear()
    },
    getDayClasses(day) {
      return {
        'invisible': !day.date && !this.showOutsideDays
      }
    },
    getDayButtonClasses(day) {
      return {
        'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground': day.selected,
        'bg-accent text-accent-foreground': day.today && !day.selected,
        'text-muted-foreground': !day.currentMonth,
        'opacity-50': day.disabled
      }
    }
  },
  watch: {
    value(newVal) {
      if (newVal) {
        this.selectedDate = newVal
        this.currentMonth = newVal.getMonth()
        this.currentYear = newVal.getFullYear()
      }
    }
  }
}
</script>
