from datetime import datetime

class TimeUtils():

    @staticmethod
    def toStringSeconds(ms):
        if ms:
            ms = int(ms)
            s = 0
            while ms - 1000 >= 0:
                s += 1
                ms -= 1000
            if ms > 0:
                return '%d.%d' % (s, ms)
            return '%d' % s
        return 0

    @staticmethod
    def toMillis(sec):
        try:
            return int(float(sec) * 1000)
        except ValueError, e:
            return 0

    @staticmethod
    def srtTimeToMillis(t):
        #00:28:14,720
        try:
            d = datetime.strptime(t, '%H:%M:%S,%f')
        except ValueError, e:
            print e
            return 0
        ms = d.hour * 3600000 + d.minute * 60000 + d.second * 1000
        ms += d.microsecond / 1000
        return ms

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





