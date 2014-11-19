class TimeUtils():

    @staticmethod
    def toStringSeconds(ms):
        ms = int(ms)
        s = 0
        while ms - 1000 >= 0:
            s += 1
            ms -= 1000
        if ms > 0:
            return '%d.%d' % (s, ms)
        return '%d' % s

    @staticmethod
    def toMillis(sec):
        try:
            return int(float(sec) * 1000)
        except ValueError, e:
            return 0

    @staticmethod
    def toTimeTuple(mediafragmentTime):
        h = m = 0
        try:
            secs = int(mediafragmentTime.split('.')[0])
        except ValueError, e:
            return (0,0,0)
        while secs >= 3600:
            h += 1
            secs -= 3600
        while secs >= 60:
            m += 1
            secs -= 60
        return (h, m, secs)





